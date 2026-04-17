function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) return false;
    }
    return true;
}

let buckets = [0n, 0n, 0n, 0n]; // 4 buckets (256 bits each)

for (let num = 1003; num <= 9999; num += 10) {
    if (!isPrime(num)) continue;

    let index = (num - 1003) / 10;

    let bucket = Math.floor(index / 256);
    let offset = index % 256;

    buckets[bucket] |= (1n << BigInt(offset));
}

// print results
for (let i = 0; i < buckets.length; i++) {
    console.log(`if (i == ${i}) return ${buckets[i].toString()};`);
}