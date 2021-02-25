class MBC {
    constructor(mmu, cartridge) {
        this.mmu = mmu;
        this.romBanks = [];
        for (let i = 0; i < cartridge.length; i += 0x4000) {
            this.romBanks.push(new Uint8Array(cartridge.buffer, i, 0x4000));
        }
    }

    set(addr, val) {}
}


class MBC1 extends MBC {
    constructor(mmu, cartridge) {
        super(mmu, cartridge);
    }

    set(addr, val) {}
}

export { MBC, MBC1 };