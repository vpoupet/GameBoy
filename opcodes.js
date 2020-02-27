const opCodes = [
    function() {
        // NOP
        // 1 4
        // - - - -
        this.pc += 1;
        this.clock += 4;
    },
    function() {
        // LD BC,d16
        // 3  12
        // - - - -
        this.pc += 3;
        this.clock += 12;
        let addr = this.mmu.get(this.pc - 2) | (this.mmu.get(this.pc - 1) << 8);
        this.b = this.mmu.get(addr);
        this.c = this.mmu.get(addr + 1);
    },
    function() {
        // LD (BC),A
        // 1  8
        // - - - -
        this.pc += 1;
        this.clock += 8;
        let bc = this.b | (this.c << 8);
        this.mmu.set(bc, this.a);
    },
    function() {
        // INC BC
        // 1  8
        // - - - -
        this.pc += 1;
        this.clock += 8;
        let bc = this.b | (this.c << 8);
        bc += 1;
        this.b = bc & 0xFF;
        this.c = (bc >> 8) & 0xFF;
    },

    function() {
        // INC B
        // 1  4
        // Z 0 H -
        this.pc += 1;
        this.clock += 4;

    }
];