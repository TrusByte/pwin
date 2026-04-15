function formatNumberShort(num) {
    num = parseFloat(num);

    if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + "B";
    }
    if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + "M";
    }
    if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + "K";
    }

    // always 2 decimals for small numbers
    return num.toFixed(2);
}
function formatUnits(value, decimals = 18, maxDecimals = 4) {
    value = value.toString();

    if (value.length <= decimals) {
        value = value.padStart(decimals + 1, '0');
    }

    let integerPart = value.slice(0, value.length - decimals);
    let decimalPart = value.slice(value.length - decimals);

    decimalPart = decimalPart.replace(/0+$/, '');
    decimalPart = decimalPart.slice(0, maxDecimals);

    let longer = decimalPart ? integerPart + "." + decimalPart : integerPart;
    return formatNumberShort(longer);
}

function shortAddress(address, isMobile) {
    if (isMobile) {
        return address.slice(0, 4) + "..." + address.slice(-4);
    } else {
        return address.slice(0, 6) + "....." + address.slice(-4);
    }

}

