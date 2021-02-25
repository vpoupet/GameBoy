class MBC {
    constructor(mmu, cartridge) {
        this.mmu = mmu;
        this.romBanks = [
            new Uint8Array(cartridge.buffer, 0, 0x4000),
            new Uint8Array(cartridge.buffer, 0x4000, 0x4000),
        ];
    }

    set(addr, val) {
    }
}


class MBC1 extends MBC {
    constructor(mmu, cartridge) {
        super(mmu, cartridge);
        this.bankingModeSelect = 0;
        this.romBankNumber = 1;
        this.secondaryBankNumber = 0;

        // prepare ROM banks
        this.romBanks = [];
        this.nbRomBanks = 2 << cartridge[0x0148];
        for (let i = 0; i < this.nbRomBanks; i++) {
            this.romBanks.push(new Uint8Array(cartridge.buffer, i * 0x4000, 0x4000));
        }
        // prepare RAM banks
        this.ramBanks = [];
        this.nbRamBanks = [0, 0, 1, 4, 16, 8][cartridge[0x0149]];
        for (let i = 0; i < this.nbRamBanks; i++) {
            this.ramBanks.push(new Uint8Array(0x2000));
        }
    }

    updateBanks() {
        if (this.bankingModeSelect === 0) {
            // RAM
            if (this.mmu.externalRamEnabled) {
                this.mmu.externalRam = this.ramBanks[0];
            } else {
                this.mmu.externalRam = undefined;
            }
            // ROM
            this.mmu.romBank0 = this.romBanks[0];
            this.mmu.romBank1 = this.romBanks[((this.secondaryBankNumber << 5) | this.romBankNumber) % this.nbRomBanks];
        } else {
            // RAM
            if (this.mmu.externalRamEnabled) {
                this.mmu.externalRam = this.ramBanks[this.secondaryBankNumber % this.nbRamBanks];
            } else {
                this.mmu.externalRam = undefined;
            }
            // ROM
            this.mmu.romBank0 = this.romBanks[(this.secondaryBankNumber << 5) % this.nbRomBanks];
            this.mmu.romBank1 = this.romBanks[((this.secondaryBankNumber << 5) | this.romBankNumber) % this.nbRomBanks];
        }
    }

    set(addr, val) {
        switch (addr >> 13) {
            case 0:
                // 0000-1FFF - RAM Enable (Write Only)
                this.mmu.externalRamEnabled = this.nbRamBanks > 0 && (val & 0x0f) === 0x0a;
                break;
            case 1:
                // 2000-3FFF - ROM Bank Number (Write Only)
                this.romBankNumber = (val & 0x1f) % this.nbRomBanks;
                if (this.romBankNumber === 0) this.romBankNumber = 1;
                break;
            case 2:
                // 4000-5FFF - RAM Bank Number - or - Upper Bits of ROM Bank Number (Write Only)
                this.secondaryBankNumber = val & 0x03;
                break;
            case 3:
                // 6000-7FFF - Banking Mode Select (Write Only)
                this.bankingModeSelect = val & 0x01;
                break;
        }
        this.updateBanks();
    }
}

export {MBC, MBC1};