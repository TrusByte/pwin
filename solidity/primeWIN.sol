// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVRFV2Plus {
    function requestRandomWords(
        bytes32 keyHash,
        uint256 subId,
        uint16 requestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        bytes calldata extraArgs
    ) external payable returns (uint256 requestId);
}

contract PrimeWIN1 {
    bool private locked;

    modifier nonReentrant() {
        require(!locked, "Reentrant");
        locked = true;
        _;
        locked = false;
    }
    // -------------------------
    // STATE
    // -------------------------
    address public owner;
    address public  pendingOwner;
    address public primeAddress;


    uint256 public addToPool = 0.9 ether;
    uint256 public vrfFee = 0.05 ether;
    uint256 public creatorFee = 0.05 ether;

    uint256 public pool;
    uint256 public vrfReserve;

    address[] public winners;
    address[] public primeWinner;
    uint8 public winnerCount;

    uint256 public constant ENTRY_FEE = 1 ether;
    address public vrfCaller = 0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2;
    IVRFV2Plus public vrfCoordinator = IVRFV2Plus(vrfCaller);

    bytes32 public keyHash =
        0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899;
    uint32 public callbackGasLimit = 200000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;

    mapping(uint256 => address) public requestToUser;

    // -------------------------
    // EVENTS
    // -------------------------
    event Enter(address indexed user, uint256 requestId);
    event RandomResult(address indexed user, uint256 number);
    event Winner(address indexed user, uint256 amount);
    event PrimeWinner(address indexed user, uint256 amount);
    event PrimeSet(address indexed user);
    event VRFFailed(address indexed user);
    event OwnershipTransferRequested(
        address indexed oldOwner,
        address indexed newOwner
    );
    event OwnershipTransferred(
        address indexed oldOwner,
        address indexed newOwner
    );

    // -------------------------
    // CONSTRUCTOR
    // -------------------------
    constructor() {
        owner = msg.sender;
    }

    function updateFees(uint256 pool_amount, uint256 vrf_amount, uint256 creator_amount) external {
        require(msg.sender == owner, "OWNER CAN UPDATE THIS SETTINGS");
        addToPool = pool_amount;
        vrfFee = vrf_amount;
        creatorFee = creator_amount;
    }
    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "Not owner");
        require(newOwner != address(0), "Zero address");

        pendingOwner = newOwner;

        emit OwnershipTransferRequested(owner, newOwner);
    }

    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Not pending owner");

        address oldOwner = owner;
        owner = pendingOwner;
        pendingOwner = address(0);

        emit OwnershipTransferred(oldOwner, owner);
    }

    // -------------------------
    // ENTER GAME
    // -------------------------
    function enter() external payable nonReentrant {
        require(msg.value == ENTRY_FEE, "1 POL NEEDED TO ENTER");

        // split funds
        pool += addToPool;
        vrfReserve += vrfFee;

        (bool ok, ) = payable(owner).call{value: creatorFee}("");
        require(ok, "Owner transfer failed");

        _requestVRF(msg.sender);
    }

    // -------------------------
    // AUTO VRF FEE
    // -------------------------
    function _getVRFFee() internal view returns (uint256) {
        if (block.basefee > 50 gwei) return 0.03 ether;
        if (block.basefee > 30 gwei) return 0.02 ether;
        return 0.01 ether;
    }

    // -------------------------
    // SAFE VRF REQUEST
    // -------------------------
    function _requestVRF(address user) internal {
        uint256 fee = _getVRFFee();

        if (vrfReserve < fee) {
            emit VRFFailed(user);
            return;
        }

        vrfReserve -= fee;

        bytes memory extraArgs = abi.encode(true); // native payment

        try
            vrfCoordinator.requestRandomWords{value: fee}(
                keyHash,
                0,
                requestConfirmations,
                callbackGasLimit,
                numWords,
                extraArgs
            )
        returns (uint256 requestId) {
            requestToUser[requestId] = user;
            emit Enter(user, requestId);
        } catch {
            vrfReserve += fee;
            emit VRFFailed(user);
        }
    }

    // -------------------------
    // VRF CALLBACK
    // -------------------------
    function rawFulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) external {
        require(msg.sender == vrfCaller, "Only ChainLink VRF can call");

        address user = requestToUser[requestId];
        if (user == address(0)) return;

        uint256 rand = (randomWords[0] % 9000) + 1000;

        emit RandomResult(user, rand);

        if (isPrimeEnding3(rand)) {
            if (primeAddress != address(0)) {
                _distribute(user);
            } else {
                primeAddress = user;
                emit PrimeSet(user);
            }
        }
    }

    // -------------------------
    // DISTRIBUTION
    // -------------------------
    function _distribute(address winner) internal {
        uint256 total = pool;

        if (total < 0.02 ether) return; // safety

        uint256 winnerShare = (total * 70) / 100;
        uint256 primeShare = (total * 29) / 100;
        uint256 reserve = total - winnerShare - primeShare;

        pool = reserve;

        (bool s1, ) = payable(winner).call{value: winnerShare}("");
        require(s1, "Winner transfer failed");

        (bool s2, ) = payable(primeAddress).call{value: primeShare}("");
        require(s2, "Prime transfer failed");

        winners.push(winner);
        primeWinner.push(primeAddress);
        emit Winner(winner, winnerShare);
        emit PrimeWinner(primeAddress, primeShare);

        primeAddress = address(0);
    }

    // -------------------------
    // PRIME CHECK (COMPRESSED BITMAP)
    // -------------------------
    function isPrimeEnding3(uint256 num) public pure returns (bool) {
        if (num < 1000 || num > 9999) return false;
        if (num % 10 != 3) return false;

        uint256 index = (num - 1003) / 10;

        uint256 bucket = index / 256;
        uint256 offset = index % 256;

        uint256 bitmap = _getBitmap(bucket);

        return ((bitmap >> offset) & 1) == 1;
    }

    // -------------------------
    // BITMAP FOR PRIME NUMBER ENDING WITH THREE
    // -------------------------
    function _getBitmap(uint256 i) internal pure returns (uint256) {
        if (i == 0)
            return
                14605016708656749763293906628862312877943254044715763211428982473786749720138;
        if (i == 1)
            return
                62872507903994305333160925863834282210063698158475761388979158028632870488428;
        if (i == 2)
            return
                30850041842485316725635724449242143371713439305151659703773234046729513353526;
        if (i == 3) return 703208462245383299944227998993463121034;
        revert("Invalid");
    }

    // -------------------------
    // VIEW
    // -------------------------
    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
