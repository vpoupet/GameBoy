const opCodes = [
    function () {
        // 00 - NOP
        // 1 4
        // - - - -
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 01 - LD BC,d16
        // 3  12
        // - - - -
        this.bc = this.mmu.get16(this.pc + 1);
        this.pc += 3;
        this.clock += 12;
    },
    function () {
        // 02 - LD (BC),A
        // 1  8
        // - - - -
        this.mmu.set(this.bc, this.a);
        this.pc += 1;
        this.clock += 12;
    },
    function () {
        // 03 - INC BC
        // 1  8
        // - - - -
        this.bc += 1;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 04 - INC B
        // 1  4
        // Z 0 H -
        this.flagH = (this.b & 0x0f) === 0x0f;
        this.b += 1;
        this.flagZ = this.b === 0;
        this.flagN = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 05 - DEC B
        // 1  4
        // Z 1 H -
        this.flagH = (this.b & 0x0f) === 0;
        this.b -= 1;
        this.flagZ = this.b === 0;
        this.flagN = 1;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 06 - LD B,d8
        // 2  8
        // - - - -
        this.b = this.mmu.get(this.pc + 1);
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 07 - RLCA
        // 1  4
        // 0 0 0 C
        this.flagC = this.a & 0x80;
        this.a = (this.a << 1) | (this.a >> 7);
        this.flagZ = 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 08 -	LD (a16),SP
        // 3  20
        // - - - -
        this.mmu.set16(this.mmu.get16(this.pc + 1), this.sp);
        this.pc += 3;
        this.clock += 20;
    },
    function () {
        // 09 - ADD HL,BC
        // 1  8
        // - 0 H C
        this.flagH = (this.hl & 0x0fff) + (this.bc & 0x0fff) > 0x0fff;
        const r = this.hl + this.bc;
        this.hl = r;
        this.flagN = 0;
        this.flagC = r > 0xffff;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 0A - LD A,(BC)
        // 1  8
        // - - - -
        this.a = this.mmu.get(this.bc);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 0B - DEC BC
        // 1  8
        // - - - -
        this.bc -= 1;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 0C - INC C
        // 1  4
        // Z 0 H -
        this.flagH = (this.c & 0x0f) === 0x0f;
        this.c += 1;
        this.flagZ = this.c === 0;
        this.flagN = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 0D - DEC C
        // 1  4
        // Z 1 H -
        this.flagH = (this.c & 0x0f) === 0;
        this.c -= 1;
        this.flagZ = this.c === 0;
        this.flagN = 1;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 0E - LD C,d8
        // 2  8
        // - - - -
        this.c = this.mmu.get(this.pc + 1);
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 0F - RRCA
        // 1  4
        // 0 0 0 C
        this.flagC = this.a & 0x01;
        this.a = (this.a >> 1) | (this.a << 7);
        this.flagZ = 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 10 - STOP 0
        // 2  4
        // - - - -
        // TODO STOP
        throw new Error("Not Implemented");
        this.pc += 2;
        this.clock += 4;
    },
    function () {
        // 11 - LD DE,d16
        // 3  12
        // - - - -
        this.de = this.mmu.get16(this.pc + 1);
        this.pc += 3;
        this.clock += 12;
    },
    function () {
        // 12 - LD (DE),A
        // 1  8
        // - - - -
        this.mmu.set(this.de, this.a);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 13 - INC DE
        // 1  8
        // - - - -
        this.de += 1;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 14 - INC D
        // 1  4
        // Z 0 H -
        this.flagH = (this.d & 0x0f) === 0x0f;
        this.d += 1;
        this.flagZ = this.d === 0;
        this.flagN = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 15 - DEC D
        // 1  4
        // Z 1 H -
        this.flagH = (this.d & 0x0f) === 0;
        this.d -= 1;
        this.flagZ = this.d === 0;
        this.flagN = 1;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 16 - LD D,d8
        // 2  8
        // - - - -
        this.d = this.mmu.get(this.pc + 1);
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 17 - RLA
        // 1  4
        // 0 0 0 C
        const r = (this.a << 1) | this.flagC;
        this.flagC = r & 0x100;
        this.a = r;
        this.flagZ = 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 18 - JR r8
        // 2  12
        // - - - -
        // Hack: convert UInt8 to Int8 with << 24 >> 24
        this.pc += 2 + (this.mmu.get(this.pc + 1) << 24 >> 24);
        this.clock += 12;
    },
    function () {
        // 19 - ADD HL,DE
        // 1  8
        // - 0 H C
        this.flagH = (this.hl & 0x0fff) + (this.de & 0x0fff) > 0x0fff;
        const r = this.hl + this.de;
        this.hl = r;
        this.flagN = 0;
        this.flagC = r > 0xffff;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 1A - LD A,(DE)
        // 1  8
        // - - - -
        this.a = this.mmu.get(this.de);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 1B - DEC DE
        // 1  8
        // - - - -
        this.de -= 1;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 1C - INC E
        // 1  4
        // Z 0 H -
        this.flagH = (this.e & 0x0f) === 0x0f;
        this.e += 1;
        this.flagZ = this.e === 0;
        this.flagN = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 1D - DEC E
        // 1  4
        // Z 1 H -
        this.flagH = (this.e & 0x0f) === 0;
        this.e -= 1;
        this.flagZ = this.e === 0;
        this.flagN = 1;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 1E - LD E,d8
        // 2  8
        // - - - -
        this.e = this.mmu.get(this.pc + 1);
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 1F - RRA
        // 1  4
        // 0 0 0 C
        const d0 = this.a & 0x01;
        this.a = (this.a >> 1) | (this.flagC << 7);
        this.flagZ = 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = d0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 20 - JR NZ,r8
        // 2  12/8
        // - - - -
        if (!this.flagZ) {
            // jump
            this.pc += 2 + (this.mmu.get(this.pc + 1) << 24 >> 24);
            this.clock += 12;
        } else {
            // don't jump
            this.pc += 2;
            this.clock += 8;
        }
    },
    function () {
        // 21 - LD HL,d16
        // 3  12
        // - - - -
        this.hl = this.mmu.get16(this.pc + 1);
        this.pc += 3;
        this.clock += 12;
    },
    function () {
        // 22 - LD (HL+),A
        // 1  8
        // - - - -
        this.mmu.set(this.hl, this.a);
        this.hl += 1;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 23 - INC HL
        // 1  8
        // - - - -
        this.hl += 1;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 24 - INC H
        // 1  4
        // Z 0 H -
        this.flagH = (this.h & 0x0f) === 0x0f;
        this.h += 1;
        this.flagZ = this.h === 0;
        this.flagN = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 25 - DEC H
        // 1  4
        // Z 1 H -
        this.flagH = (this.h & 0x0f) === 0;
        this.h -= 1;
        this.flagZ = this.h === 0;
        this.flagN = 1;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 26 - LD H,d8
        // 2  8
        // - - - -
        this.h = this.mmu.get(this.pc + 1);
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 27 - DAA
        // 1  4
        // Z - 0 C
        if (!this.flagN) {  // after an addition, adjust if (half-)carry occurred or if result is out of bounds
            if (this.flagC || this.a > 0x99) {
                this.a += 0x60;
                this.flagC = 1;
            }
            if (this.flagH || (this.a & 0x0f) > 0x09) {
                this.a += 0x06;
            }
        } else {  // after a subtraction, only adjust if (half-)carry occurred
            if (this.flagC) {
                this.a -= 0x60;
            }
            if (this.flagH) {
                this.a -= 0x06;
            }
        }
        this.flagZ = this.a === 0;
        this.flagH = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 28 - JR Z,r8
        // 2  12/8
        // - - - -
        if (this.flagZ) {
            // jump
            this.pc += 2 + (this.mmu.get(this.pc + 1) << 24 >> 24);
            this.clock += 12;
        } else {
            // don't jump
            this.pc += 2;
            this.clock += 8;
        }
    },
    function () {
        // 29 - ADD HL,HL
        // 1  8
        // - 0 H C
        this.flagH = (this.hl & 0x0fff) + (this.hl & 0x0fff) > 0x0fff;
        const r = this.hl + this.hl;
        this.hl = r;
        this.flagN = 0;
        this.flagC = r > 0xffff;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 2A - LD A,(HL+)
        // 1  8
        // - - - -
        this.a = this.mmu.get(this.hl);
        this.hl += 1;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 2B - DEC HL
        // 1  8
        // - - - -
        this.hl -= 1;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 2C - INC L
        // 1  4
        // Z 0 H -
        this.flagH = (this.l & 0x0f) === 0x0f;
        this.l += 1;
        this.flagZ = this.l === 0;
        this.flagN = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 2D - DEC L
        // 1  4
        // Z 1 H -
        this.flagH = (this.l & 0x0f) === 0;
        this.l -= 1;
        this.flagZ = this.l === 0;
        this.flagN = 1;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 2E - LD L,d8
        // 2  8
        // - - - -
        this.l = this.mmu.get(this.pc + 1);
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 2F - CPL
        // 1  4
        // - 1 1 -
        this.flagN = 1;
        this.flagH = 1;
        this.a = ~this.a;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 30 - JR NC,r8
        // 2  12/8
        // - - - -
        if (!this.flagC) {
            // jump
            this.pc += 2 + (this.mmu.get(this.pc + 1) << 24 >> 24);
            this.clock += 12;
        } else {
            // don't jump
            this.pc += 2;
            this.clock += 8;
        }
    },
    function () {
        // 31 - LD SP,d16
        // 3  12
        // - - - -
        this.sp = this.mmu.get16(this.pc + 1);
        this.pc += 3;
        this.clock += 12;
    },
    function () {
        // 32 - LD (HL-),A
        // 1  8
        // - - - -
        this.mmu.set(this.hl, this.a);
        this.hl -= 1;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 33 - INC SP
        // 1  8
        // - - - -
        this.sp += 1;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 34 - INC (HL)
        // 1  12
        // Z 0 H -
        const x = this.mmu.get(this.hl);
        this.flagZ = x === 0xff;
        this.flagN = 0;
        this.flagH = (x & 0x0f) === 0x0f;
        this.mmu.set(this.hl, x + 1);
        this.pc += 1;
        this.clock += 12;
    },
    function () {
        // 35 - DEC (HL)
        // 1  12
        // Z 1 H -
        const x = this.mmu.get(this.hl);
        this.flagZ = x === 0x01;
        this.flagN = 0;
        this.flagH = (x & 0x0f) === 0;
        this.mmu.set(this.hl, x - 1);
        this.pc += 1;
        this.clock += 12;
    },
    function () {
        // 36 - LD (HL),d8
        // 2  12
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.pc + 1));
        this.pc += 2;
        this.clock += 12;
    },
    function () {
        // 37 - SCF
        // 1  4
        // - 0 0 1
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 1;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 38 - JR C,r8
        // 2  12/8
        // - - - -
        if (this.flagC) {
            // jump
            this.pc += 2 + (this.mmu.get(this.pc + 1) << 24 >> 24);
            this.clock += 12;
        } else {
            // don't jump
            this.pc += 2;
            this.clock += 8;
        }
    },
    function () {
        // 39 - ADD HL,SP
        // 1  8
        // - 0 H C
        this.flagH = (this.hl & 0x0fff) + (this.sp & 0x0fff) > 0x0fff;
        const r = this.hl + this.sp;
        this.hl = r;
        this.flagN = 0;
        this.flagC = r > 0xffff;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 3A - LD A,(HL-)
        // 1  8
        // - - - -
        this.a = this.mmu.get(this.hl);
        this.hl -= 1;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 3B - DEC SP
        // 1  8
        // - - - -
        this.sp -= 1;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 3C - INC A
        // 1  4
        // Z 0 H -
        this.flagH = (this.a & 0x0f) === 0x0f;
        this.a += 1;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 3D - DEC A
        // 1  4
        // Z 1 H -
        this.flagH = (this.a & 0x0f) === 0;
        this.a -= 1;
        this.flagZ = this.a === 0;
        this.flagN = 1;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 3E - LD A,d8
        // 2  8
        // - - - -
        this.a = this.mmu.get(this.pc + 1);
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 3F - CCF
        // 1  4
        // - 0 0 C
        this.flagC = ~this.flagC;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 40 - LD B,B
        // 1  4
        // - - - -
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 41 - LD B,C
        // 1  4
        // - - - -
        this.b = this.c;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 42 - LD B,D
        // 1  4
        // - - - -
        this.b = this.d;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 43 - LD B,E
        // 1  4
        // - - - -
        this.b = this.e;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 44 - LD B,H
        // 1  4
        // - - - -
        this.b = this.h;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 45 - LD B,L
        // 1  4
        // - - - -
        this.b = this.l;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 46 - LD B,(HL)
        // 1  8
        // - - - -
        this.b = this.mmu.get(this.hl);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 47 - LD B,A
        // 1  4
        // - - - -
        this.b = this.a;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 48 - LD C,B
        // 1  4
        // - - - -
        this.c = this.b;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 49 - LD C,C
        // 1  4
        // - - - -
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 4A - LD C,D
        // 1  4
        // - - - -
        this.c = this.d;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 4B - LD C,E
        // 1  4
        // - - - -
        this.c = this.e;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 4C - LD C,H
        // 1  4
        // - - - -
        this.c = this.h;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 4D - LD C,L
        // 1  4
        // - - - -
        this.c = this.l;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 4E - LD C,(HL)
        // 1  8
        // - - - -
        this.c = this.mmu.get(this.hl);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 4F - LD C,A
        // 1  4
        // - - - -
        this.c = this.a;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 50 - LD D,B
        // 1  4
        // - - - -
        this.d = this.b;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 51 - LD D,C
        // 1  4
        // - - - -
        this.d = this.c;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 52 - LD D,D
        // 1  4
        // - - - -
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 53 - LD D,E
        // 1  4
        // - - - -
        this.d = this.e;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 54 - LD D,H
        // 1  4
        // - - - -
        this.d = this.h;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 55 - LD D,L
        // 1  4
        // - - - -
        this.d = this.l;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 56 - LD D,(HL)
        // 1  8
        // - - - -
        this.d = this.mmu.get(this.hl);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 57 - LD D,A
        // 1  4
        // - - - -
        this.d = this.a;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 58 - LD E,B
        // 1  4
        // - - - -
        this.e = this.b;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 59 - LD E,C
        // 1  4
        // - - - -
        this.e = this.c;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 5A - LD E,D
        // 1  4
        // - - - -
        this.e = this.d;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 5B - LD E,E
        // 1  4
        // - - - -
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 5C - LD E,H
        // 1  4
        // - - - -
        this.e = this.h;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 5D - LD E,L
        // 1  4
        // - - - -
        this.e = this.l;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 5E - LD E,(HL)
        // 1  8
        // - - - -
        this.e = this.mmu.get(this.hl);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 5F - LD E,A
        // 1  4
        // - - - -
        this.e = this.a;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 60 - LD H,B
        // 1  4
        // - - - -
        this.h = this.b;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 61 - LD H,C
        // 1  4
        // - - - -
        this.h = this.c;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 62 - LD H,D
        // 1  4
        // - - - -
        this.h = this.d;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 63 - LD H,E
        // 1  4
        // - - - -
        this.h = this.e;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 64 - LD H,H
        // 1  4
        // - - - -
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 65 - LD H,L
        // 1  4
        // - - - -
        this.h = this.l;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 66 - LD H,(HL)
        // 1  8
        // - - - -
        this.h = this.mmu.get(this.hl);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 67 - LD H,A
        // 1  4
        // - - - -
        this.h = this.a;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 68 - LD L,B
        // 1  4
        // - - - -
        this.l = this.b;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 69 - LD L,C
        // 1  4
        // - - - -
        this.l = this.c;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 6A - LD L,D
        // 1  4
        // - - - -
        this.l = this.d;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 6B - LD L,E
        // 1  4
        // - - - -
        this.l = this.e;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 6C - LD L,H
        // 1  4
        // - - - -
        this.l = this.h;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 6D - LD L,L
        // 1  4
        // - - - -
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 6E - LD L,(HL)
        // 1  8
        // - - - -
        this.l = this.mmu.get(this.hl);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 6F - LD L,A
        // 1  4
        // - - - -
        this.l = this.a;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 70 - LD (HL),B
        // 1  8
        // - - - -
        this.mmu.set(this.hl, this.b);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 71 - LD (HL),C
        // 1  8
        // - - - -
        this.mmu.set(this.hl, this.c);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 72 - LD (HL),D
        // 1  8
        // - - - -
        this.mmu.set(this.hl, this.d);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 73 - LD (HL),E
        // 1  8
        // - - - -
        this.mmu.set(this.hl, this.e);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 74 - LD (HL),H
        // 1  8
        // - - - -
        this.mmu.set(this.hl, this.h);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 75 - LD (HL),L
        // 1  8
        // - - - -
        this.mmu.set(this.hl, this.l);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 76 - HALT
        // 1  4
        // - - - -
        this.isHalted = true;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 77 - LD (HL),A
        // 1  8
        // - - - -
        this.mmu.set(this.hl, this.a);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 78 - LD A,B
        // 1  4
        // - - - -
        this.a = this.b;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 79 - LD A,C
        // 1  4
        // - - - -
        this.a = this.c;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 7A - LD A,D
        // 1  4
        // - - - -
        this.a = this.d;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 7B - LD A,E
        // 1  4
        // - - - -
        this.a = this.e;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 7C - LD A,H
        // 1  4
        // - - - -
        this.a = this.h;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 7D - LD A,L
        // 1  4
        // - - - -
        this.a = this.l;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 7E - LD A,(HL)
        // 1  8
        // - - - -
        this.a = this.mmu.get(this.hl);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 7F - LD A,A
        // 1  4
        // - - - -
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 80 - ADD A,B
        // 1  4
        // Z 0 H C
        const r = this.a + this.b;
        this.flagH = (this.a & 0x0f) + (this.b & 0x0f) > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 81 - ADD A,C
        // 1  4
        // Z 0 H C
        const r = this.a + this.c;
        this.flagH = (this.a & 0x0f) + (this.c & 0x0f) > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 82 - ADD A,D
        // 1  4
        // Z 0 H C
        const r = this.a + this.d;
        this.flagH = (this.a & 0x0f) + (this.d & 0x0f) > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 83 - ADD A,E
        // 1  4
        // Z 0 H C
        const r = this.a + this.e;
        this.flagH = (this.a & 0x0f) + (this.e & 0x0f) > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 84 - ADD A,H
        // 1  4
        // Z 0 H C
        const r = this.a + this.h;
        this.flagH = (this.a & 0x0f) + (this.h & 0x0f) > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 85 - ADD A,L
        // 1  4
        // Z 0 H C
        const r = this.a + this.l;
        this.flagH = (this.a & 0x0f) + (this.l & 0x0f) > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 86 - ADD A,(HL)
        // 1  8
        // Z 0 H C
        const x = this.mmu.get(this.hl);
        const r = this.a + x;
        this.flagH = (this.a & 0x0f) + (x & 0x0f) > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 87 - ADD A,A
        // 1  4
        // Z 0 H C
        const r = this.a + this.a;
        this.flagH = (this.a & 0x0f) + (this.a & 0x0f) > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 88 - ADC A,B
        // 1  4
        // Z 0 H C
        const cy = this.flagC;
        const r = this.a + this.b + cy;
        this.flagH = (this.a & 0x0f) + (this.b & 0x0f) + cy > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 89 - ADC A,C
        // 1  4
        // Z 0 H C
        const cy = this.flagC;
        const r = this.a + this.c + cy;
        this.flagH = (this.a & 0x0f) + (this.c & 0x0f) + cy > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 8A - ADC A,D
        // 1  4
        // Z 0 H C
        const cy = this.flagC;
        const r = this.a + this.d + cy;
        this.flagH = (this.a & 0x0f) + (this.d & 0x0f) + cy > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 8B - ADC A,E
        // 1  4
        // Z 0 H C
        const cy = this.flagC;
        const r = this.a + this.e + cy;
        this.flagH = (this.a & 0x0f) + (this.e & 0x0f) + cy > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 8C - ADC A,H
        // 1  4
        // Z 0 H C
        const cy = this.flagC;
        const r = this.a + this.h + cy;
        this.flagH = (this.a & 0x0f) + (this.h & 0x0f) + cy > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 8D - ADC A,L
        // 1  4
        // Z 0 H C
        const cy = this.flagC;
        const r = this.a + this.l + cy;
        this.flagH = (this.a & 0x0f) + (this.l & 0x0f) + cy > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 8E - ADC A,(HL)
        // 1  8
        // Z 0 H C
        const cy = this.flagC;
        const x = this.mmu.get(this.hl);
        const r = this.a + x + cy;
        this.flagH = (this.a & 0x0f) + (x & 0x0f) + cy > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 8F - ADC A,A
        // 1  4
        // Z 0 H C
        const cy = this.flagC;
        const r = this.a + this.a + cy;
        this.flagH = (this.a & 0x0f) + (this.a & 0x0f) + cy > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagN = 0;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 90 - SUB B
        // 1  4
        // Z 1 H C
        const r = this.a - this.b;
        this.flagH = (this.b & 0x0f) > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 91 - SUB C
        // 1  4
        // Z 1 H C
        const r = this.a - this.c;
        this.flagH = (this.c & 0x0f) > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 92 - SUB D
        // 1  4
        // Z 1 H C
        const r = this.a - this.d;
        this.flagH = (this.d & 0x0f) > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 93 - SUB E
        // 1  4
        // Z 1 H C
        const r = this.a - this.e;
        this.flagH = (this.e & 0x0f) > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 94 - SUB H
        // 1  4
        // Z 1 H C
        const r = this.a - this.h;
        this.flagH = (this.h & 0x0f) > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 95 - SUB L
        // 1  4
        // Z 1 H C
        const r = this.a - this.l;
        this.flagH = (this.l & 0x0f) > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 96 - SUB (HL)
        // 1  8
        // Z 1 H C
        const x = this.mmu.get(this.hl);
        const r = this.a - x;
        this.flagH = (x & 0x0f) > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // 97 - SUB A
        // 1  4
        // Z 1 H C
        const r = this.a - this.a;
        this.flagH = (this.a & 0x0f) > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 98 - SBC A,B
        // 1  4
        // Z 1 H C
        const cy = this.flagC;
        const r = this.a - this.b - cy;
        this.flagH = (this.b & 0x0f) + cy > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 99 - SBC A,C
        // 1  4
        // Z 1 H C
        const cy = this.flagC;
        const r = this.a - this.c - cy;
        this.flagH = (this.c & 0x0f) + cy > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 9A - SBC A,D
        // 1  4
        // Z 1 H C
        const cy = this.flagC;
        const r = this.a - this.d - cy;
        this.flagH = (this.d & 0x0f) + cy > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 9B - SBC A,E
        // 1  4
        // Z 1 H C
        const cy = this.flagC;
        const r = this.a - this.e - cy;
        this.flagH = (this.e & 0x0f) + cy > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 9C - SBC A,H
        // 1  4
        // Z 1 H C
        const cy = this.flagC;
        const r = this.a - this.h - cy;
        this.flagH = (this.h & 0x0f) + cy > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 9D - SBC A,L
        // 1  4
        // Z 1 H C
        const cy = this.flagC;
        const r = this.a - this.l - cy;
        this.flagH = (this.l & 0x0f) + cy > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 9E - SBC A,(HL)
        // 1  8
        // Z 1 H C
        const cy = this.flagC;
        const x = this.mmu.get(this.hl);
        const r = this.a - x - cy;
        this.flagH = (x & 0x0f) + cy > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // 9F - SBC A,A
        // 1  4
        // Z 1 H C
        const cy = this.flagC;
        const r = this.a - this.a - cy;
        this.flagH = (this.a & 0x0f) + cy > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // A0 - AND B
        // 1  4
        // Z 0 1 0
        this.a &= this.b;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 1;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // A1 - AND C
        // 1  4
        // Z 0 1 0
        this.a &= this.c;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 1;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // A2 - AND D
        // 1  4
        // Z 0 1 0
        this.a &= this.d;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 1;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // A3 - AND E
        // 1  4
        // Z 0 1 0
        this.a &= this.e;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 1;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // A4 - AND H
        // 1  4
        // Z 0 1 0
        this.a &= this.h;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 1;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // A5 - AND L
        // 1  4
        // Z 0 1 0
        this.a &= this.l;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 1;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // A6 - AND (HL)
        // 1  8
        // Z 0 1 0
        this.a &= this.mmu.get(this.hl);
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 1;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // A7 - AND A
        // 1  4
        // Z 0 1 0
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 1;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // A8 - XOR B
        // 1  4
        // Z 0 0 0
        this.a ^= this.b;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // A9 - XOR C
        // 1  4
        // Z 0 0 0
        this.a ^= this.c;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // AA - XOR D
        // 1  4
        // Z 0 0 0
        this.a ^= this.d;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // AB - XOR E
        // 1  4
        // Z 0 0 0
        this.a ^= this.e;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // AC - XOR H
        // 1  4
        // Z 0 0 0
        this.a ^= this.h;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // AD - XOR L
        // 1  4
        // Z 0 0 0
        this.a ^= this.l;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // AE - XOR (HL)
        // 1  8
        // Z 0 0 0
        this.a ^= this.mmu.get(this.hl);
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // AF - XOR A
        // 1  4
        // Z 0 0 0
        this.a = 0;
        this.flagZ = 1;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // B0 - OR B
        // 1  4
        // Z 0 0 0
        this.a |= this.b;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // B1 - OR C
        // 1  4
        // Z 0 0 0
        this.a |= this.c;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // B2 - OR D
        // 1  4
        // Z 0 0 0
        this.a |= this.d;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // B3 - OR E
        // 1  4
        // Z 0 0 0
        this.a |= this.e;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // B4 - OR H
        // 1  4
        // Z 0 0 0
        this.a |= this.h;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // B5 - OR L
        // 1  4
        // Z 0 0 0
        this.a |= this.l;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // B6 - OR (HL)
        // 1  8
        // Z 0 0 0
        this.a |= this.mmu.get(this.hl);
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // B7 - OR A
        // 1  4
        // Z 0 0 0
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // B8 - CP B
        // 1  4
        // Z 1 H C
        const r = this.a - this.b;
        this.flagZ = r === 0;
        this.flagN = 1;
        this.flagH = (this.a & 0x0f) < (this.b & 0x0f);
        this.flagC = r < 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // B9 - CP C
        // 1  4
        // Z 1 H C
        const r = this.a - this.c;
        this.flagZ = r === 0;
        this.flagN = 1;
        this.flagH = (this.a & 0x0f) < (this.c & 0x0f);
        this.flagC = r < 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // BA - CP D
        // 1  4
        // Z 1 H C
        const r = this.a - this.d;
        this.flagZ = r === 0;
        this.flagN = 1;
        this.flagH = (this.a & 0x0f) < (this.d & 0x0f);
        this.flagC = r < 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // BB - CP E
        // 1  4
        // Z 1 H C
        const r = this.a - this.e;
        this.flagZ = r === 0;
        this.flagN = 1;
        this.flagH = (this.a & 0x0f) < (this.e & 0x0f);
        this.flagC = r < 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // BC - CP H
        // 1  4
        // Z 1 H C
        const r = this.a - this.h;
        this.flagZ = r === 0;
        this.flagN = 1;
        this.flagH = (this.a & 0x0f) < (this.h & 0x0f);
        this.flagC = r < 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // BD - CP L
        // 1  4
        // Z 1 H C
        const r = this.a - this.l;
        this.flagZ = r === 0;
        this.flagN = 1;
        this.flagH = (this.a & 0x0f) < (this.l & 0x0f);
        this.flagC = r < 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // BE - CP (HL)
        // 1  8
        // Z 1 H C
        const x = this.mmu.get(this.hl);
        const r = this.a - x;
        this.flagZ = r === 0;
        this.flagN = 1;
        this.flagH = (this.a & 0x0f) < (x & 0x0f);
        this.flagC = r < 0;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // BF - CP A
        // 1  4
        // Z 1 H C
        this.flagZ = 1;
        this.flagN = 1;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // C0 - RET NZ
        // 1  20/8
        // - - - -
        if (!this.flagZ) {
            // return
            this.pc = this.mmu.get16(this.sp);
            this.sp += 2;
            this.clock += 20;
        } else {
            this.pc += 1;
            this.clock += 8;
        }
    },
    function () {
        // C1 - POP BC
        // 1  12
        // - - - -
        this.bc = this.mmu.get16(this.sp);
        this.sp += 2;
        this.pc += 1;
        this.clock += 12;
    },
    function () {
        // C2 - JP NZ,a16
        // 3  16/12
        // - - - -
        if (!this.flagZ) {
            this.pc = this.mmu.get16(this.pc + 1);
            this.clock += 16;
        } else {
            this.pc += 3;
            this.clock += 12;
        }
    },
    function () {
        // C3 - JP a16
        // 3  16
        // - - - -
        this.pc = this.mmu.get16(this.pc + 1);
        this.clock += 16;
    },
    function () {
        // C4 - CALL NZ,a16
        // 3  24/12
        // - - - -
        if (!this.flagZ) {
            this.sp -= 2;
            this.mmu.set16(this.sp, this.pc + 3);
            this.pc = this.mmu.get16(this.pc + 1);
            this.clock += 24;
        } else {
            this.pc += 3;
            this.clock += 12;
        }
    },
    function () {
        // C5 - PUSH BC
        // 1  16
        // - - - -
        this.sp -= 2;
        this.mmu.set16(this.sp, this.bc);
        this.pc += 1;
        this.clock += 16;
    },
    function () {
        // C6 - ADD A,d8
        // 2  8
        // Z 0 H C
        const x = this.mmu.get(this.pc + 1);
        const r = this.a + x;
        this.flagN = 0;
        this.flagH = (this.a & 0x0f) + (x & 0x0f) > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagZ = this.a === 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // C7 - RST 00H
        // 1  16
        // - - - -
        this.sp -= 2;
        this.mmu.set16(this.sp, this.pc + 1);
        this.pc = 0x00;
        this.clock += 16;
    },
    function () {
        // C8 - RET Z
        // 1  20/8
        // - - - -
        if (this.flagZ) {
            // return
            this.pc = this.mmu.get16(this.sp);
            this.sp += 2;
            this.clock += 20;
        } else {
            this.pc += 1;
            this.clock += 8;
        }
    },
    function () {
        // C9 - RET
        // 1  16
        // - - - -
        this.pc = this.mmu.get16(this.sp);
        this.sp += 2;
        this.clock += 16;
    },
    function () {
        // CA - JP Z,a16
        // 3  16/12
        // - - - -
        if (this.flagZ) {
            this.pc = this.mmu.get16(this.pc + 1);
            this.clock += 16;
        } else {
            this.pc += 3;
            this.clock += 12;
        }
    },
    function () {
        // CB - PREFIX CB
        // 2  4
        // - - - -
        opCodesCB[this.mmu.get(this.pc + 1)].bind(this)();
    },
    function () {
        // CC - CALL Z,a16
        // 3  24/12
        // - - - -
        if (this.flagZ) {
            this.sp -= 2;
            this.mmu.set16(this.sp, this.pc + 3);
            this.pc = this.mmu.get16(this.pc + 1);
            this.clock += 24;
        } else {
            this.pc += 3;
            this.clock += 12;
        }
    },
    function () {
        // CD - CALL a16
        // 3  24
        // - - - -
        this.sp -= 2;
        this.mmu.set16(this.sp, this.pc + 3);
        this.pc = this.mmu.get16(this.pc + 1);
        this.clock += 24;
    },
    function () {
        // CE - ADC A,d8
        // 2  8
        // Z 0 H C
        const cy = this.flagC;
        const x = this.mmu.get(this.pc);
        const r = this.a + x + cy;
        this.flagN = 0;
        this.flagH = (this.a & 0x0f) + (x & 0x0f) + cy > 0x0f;
        this.flagC = r > 0xff;
        this.a = r;
        this.flagZ = this.a === 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // CF - RST 08H
        // 1  16
        // - - - -
        this.sp -= 2;
        this.mmu.set16(this.sp, this.pc + 1);
        this.pc = 0x08;
        this.clock += 16;
    },
    function () {
        // D0 - RET NC
        // 1  20/8
        // - - - -
        if (!this.flagC) {
            // return
            this.pc = this.mmu.get16(this.sp);
            this.sp += 2;
            this.clock += 20;
        } else {
            this.pc += 1;
            this.clock += 8;
        }
    },
    function () {
        // D1 - POP DE
        // 1  12
        // - - - -
        this.de = this.mmu.get16(this.sp);
        this.sp += 2;
        this.pc += 1;
        this.clock += 12;
    },
    function () {
        // D2 - JP NC,a16
        // 3  16/12
        // - - - -
        if (!this.flagC) {
            this.pc = this.mmu.get16(this.pc + 1);
            this.clock += 16;
        } else {
            this.pc += 3;
            this.clock += 12;
        }
    },
    function () {
        // D3 - Invalid OpCode
        throw new Error("Invalid OpCode");
    },
    function () {
        // D4 - CALL NC,a16
        // 3  24/12
        // - - - -
        if (!this.flagC) {
            this.sp -= 2;
            this.mmu.set16(this.sp, this.pc + 3);
            this.pc = this.mmu.get16(this.pc + 1);
            this.clock += 24;
        } else {
            this.pc += 3;
            this.clock += 12;
        }
    },
    function () {
        // D5 - PUSH DE
        // 1  16
        // - - - -
        this.sp -= 2;
        this.mmu.set16(this.sp, this.de);
        this.pc += 1;
        this.clock += 16;
    },
    function () {
        // D6 - SUB d8
        // 2  8
        // Z 1 H C
        const x = this.mmu.get(this.pc + 1);
        const r = this.a - x;
        this.flagH = (x & 0x0f) > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // D7 - RST 10H
        // 1  16
        // - - - -
        this.sp -= 2;
        this.mmu.set16(this.sp, this.pc + 1);
        this.pc = 0x10;
        this.clock += 16;
    },
    function () {
        // D8 - RET C
        // 1  20/8
        // - - - -
        if (this.flagC) {
            // return
            this.pc = this.mmu.get16(this.sp);
            this.sp += 2;
            this.clock += 20;
        } else {
            this.pc += 1;
            this.clock += 8;
        }
    },
    function () {
        // D9 - RETI
        // 1  16
        // - - - -
        this.pc = this.mmu.get16(this.sp);
        this.interruptMasterEnable = true;
        this.sp += 2;
        this.clock += 16;
    },
    function () {
        // DA - JP C,a16
        // 3  16/12
        // - - - -
        if (this.flagC) {
            this.pc = this.mmu.get16(this.pc + 1);
            this.clock += 16;
        } else {
            this.pc += 3;
            this.clock += 12;
        }
    },
    function () {
        // DB - Invalid OpCode
        throw new Error("Invalid OpCode");
    },
    function () {
        // DC - CALL C,a16
        // 3  24/12
        // - - - -
        if (this.flagC) {
            this.sp -= 2;
            this.mmu.set16(this.sp, this.pc + 3);
            this.pc = this.mmu.get16(this.pc + 1);
            this.clock += 24;
        } else {
            this.pc += 3;
            this.clock += 12;
        }
    },
    function () {
        // DD - Invalid OpCode
        throw new Error("Invalid OpCode");
    },
    function () {
        // DE - SBC A,d8
        // 2  8
        // Z 1 H C
        const cy = this.flagC;
        const x = this.mmu.get(this.pc + 1);
        const r = this.a - x - cy;
        this.flagH = (x & 0x0f) + cy > (this.a & 0x0f);
        this.flagC = r < 0;
        this.a = r;
        this.flagN = 1;
        this.flagZ = this.a === 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // DF - RST 18H
        // 1  16
        // - - - -
        this.sp -= 2;
        this.mmu.set16(this.sp, this.pc + 1);
        this.pc = 0x18;
        this.clock += 16;
    },
    function () {
        // E0 - LDH (a8),A
        // 2  12
        // - - - -
        this.mmu.set(0xff00 + this.mmu.get(this.pc + 1), this.a);
        this.pc += 2;
        this.clock += 12;
    },
    function () {
        // E1 - POP HL
        // 1  12
        // - - - -
        this.hl = this.mmu.get16(this.sp);
        this.sp += 2;
        this.pc += 1;
        this.clock += 12;
    },
    function () {
        // E2 - LD (C),A
        // 1  8
        // - - - -
        this.mmu.set(0xff00 + this.c, this.a);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // E3 - Invalid OpCode
        throw new Error("Invalid OpCode");
    },
    function () {
        // E4 - Invalid OpCode
        throw new Error("Invalid OpCode");
    },
    function () {
        // E5 - PUSH HL
        // 1  16
        // - - - -
        this.sp -= 2;
        this.mmu.set16(this.sp, this.hl);
        this.pc += 1;
        this.clock += 16;
    },
    function () {
        // E6 - AND d8
        // 2  8
        // Z 0 1 0
        this.a &= this.mmu.get(this.pc + 1);
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 1;
        this.flagC = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // E7 - RST 20H
        // 1  16
        // - - - -
        this.sp -= 2;
        this.mmu.set16(this.sp, this.pc + 1);
        this.pc = 0x20;
        this.clock += 16;
    },
    function () {
        // E8 - ADD SP,r8
        // 2  16
        // 0 0 H C
        const x = (this.mmu.get(this.pc + 1) << 24 >> 24)
        // TODO Find out if flagH should be set when r8 is negative and addition produces a borrow
        this.flagH = (this.sp & 0x0fff) + x > 0x0fff;
        const r = this.sp + x;
        this.sp = r;
        this.flagZ = 0;
        this.flagN = 0;
        // TODO Find out if flagC should be set when r8 is negative and addition produces a borrow
        this.flagC = r > 0xffff;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // E9 - JP (HL)
        // 1  4
        // - - - -
        this.pc = this.hl;
        this.clock += 4;
    },
    function () {
        // EA - LD (a16),A
        // 3  16
        // - - - -
        this.mmu.set(this.mmu.get16(this.pc + 1), this.a);
        this.pc += 3;
        this.clock += 16;
    },
    function () {
        // EB - Invalid OpCode
        throw new Error("Invalid OpCode");
    },
    function () {
        // EC - Invalid OpCode
        throw new Error("Invalid OpCode");
    },
    function () {
        // ED - Invalid OpCode
        throw new Error("Invalid OpCode");
    },
    function () {
        // EE - XOR d8
        // 2  8
        // Z 0 0 0
        this.a ^= this.mmu.get(this.pc + 1);
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // EF - RST 28H
        // 1  16
        // - - - -
        this.sp -= 2;
        this.mmu.set16(this.sp, this.pc + 1);
        this.pc = 0x28;
        this.clock += 16;
    },
    function () {
        // F0 - LDH A,(a8)
        // 2  12
        // - - - -
        this.a = this.mmu.get(0xff00 + this.mmu.get(this.pc + 1));
        this.pc += 2;
        this.clock += 12;
    },
    function () {
        // F1 - POP AF
        // 1  12
        // Z N H C
        this.af = this.mmu.get16(this.sp);
        this.sp += 2;
        this.pc += 1;
        this.clock += 12;
    },
    function () {
        // F2 - LD A,(C)
        // 1  8
        // - - - -
        this.a = this.mmu.get(0xff00 + this.c);
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // F3 - DI
        // 1  4
        // - - - -
        this.interruptMasterEnable = false;
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // F4 - Invalid OpCode
        throw new Error("Invalid OpCode");
    },
    function () {
        // F5 - PUSH AF
        // 1  16
        // - - - -
        this.sp -= 2;
        this.mmu.set16(this.sp, this.af);
        this.pc += 1;
        this.clock += 16;
    },
    function () {
        // F6 - OR d8
        // 2  8
        // Z 0 0 0
        this.a |= this.mmu.get(this.pc + 1);
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // F7 - RST 30H
        // 1  16
        // - - - -
        this.sp -= 2;
        this.mmu.set16(this.sp, this.pc + 1);
        this.pc = 0x30;
        this.clock += 16;
    },
    function () {
        // F8 - LD HL,SP+r8
        // 2  12
        // 0 0 H C
        const x = this.mmu.get(this.pc + 1) << 24 >> 24;
        this.hl = this.mmu.get16(this.sp + x);
        this.flagZ = 0;
        this.flagN = 0;
        this.flagH = (this.sp & 0x0fff) + x > 0x0fff;
        this.flagC = this.sp + x > 0xffff;
        this.pc += 2;
        this.clock += 12;
    },
    function () {
        // F9 - LD SP,HL
        // 1  8
        // - - - -
        this.sp = this.hl;
        this.pc += 1;
        this.clock += 8;
    },
    function () {
        // FA - LD A,(a16)
        // 3  16
        // - - - -
        this.a = this.mmu.get(this.mmu.get16(this.pc + 1));
        this.pc += 3;
        this.clock += 16;
    },
    function () {
        // FB - EI
        // 1  4
        // - - - -
        this.interruptMasterEnable = true
        this.pc += 1;
        this.clock += 4;
    },
    function () {
        // FC - Invalid OpCode
        throw new Error("Invalid OpCode");
    },
    function () {
        // FD - Invalid OpCode
        throw new Error("Invalid OpCode");
    },
    function () {
        // FE - CP d8
        // 2  8
        // Z 1 H C
        const x = this.mmu.get(this.pc + 1);
        const r = this.a - x;
        this.flagZ = r === 0;
        this.flagN = 1;
        this.flagH = (this.a & 0x0f) < (x & 0x0f);
        this.flagC = r < 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // FF - RST 38H
        // 1  16
        // - - - -
        this.sp -= 2;
        this.mmu.set16(this.sp, this.pc + 1);
        this.pc = 0x38;
        this.clock += 16;
    },
];

const opCodesCB = [
    function () {
        // 00 - RLC B
        // 2  8
        // Z 0 0 C
        this.flagC = this.b & 0x80;
        this.b = (this.b << 1) | (this.b >> 7);
        this.flagZ = this.b === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 01 - RLC C
        // 2  8
        // Z 0 0 C
        this.flagC = this.c & 0x80;
        this.c = (this.c << 1) | (this.c >> 7);
        this.flagZ = this.c === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 02 - RLC D
        // 2  8
        // Z 0 0 C
        this.flagC = this.d & 0x80;
        this.d = (this.d << 1) | (this.d >> 7);
        this.flagZ = this.d === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 03 - RLC E
        // 2  8
        // Z 0 0 C
        this.flagC = this.e & 0x80;
        this.e = (this.e << 1) | (this.e >> 7);
        this.flagZ = this.e === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 04 - RLC H
        // 2  8
        // Z 0 0 C
        this.flagC = this.h & 0x80;
        this.h = (this.h << 1) | (this.h >> 7);
        this.flagZ = this.h === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 05 - RLC L
        // 2  8
        // Z 0 0 C
        this.flagC = this.l & 0x80;
        this.l = (this.l << 1) | (this.l >> 7);
        this.flagZ = this.l === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 06 - RLC (HL)
        // 2  16
        // Z 0 0 C
        const x = this.mmu.get(this.hl);
        this.flagC = x & 0x80;
        this.mmu.set(this.hl, (x << 1) | (x >> 7));
        this.flagZ = x === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 07 - RLC A
        // 2  8
        // Z 0 0 C
        this.flagC = this.a & 0x80;
        this.a = (this.a << 1) | (this.a >> 7);
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 08 - RRC B
        // 2  8
        // Z 0 0 C
        this.flagC = this.b & 0x01;
        this.b = (this.b >> 1) | (this.b << 7);
        this.flagZ = this.b === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 09 - RRC C
        // 2  8
        // Z 0 0 C
        this.flagC = this.c & 0x01;
        this.c = (this.c >> 1) | (this.c << 7);
        this.flagZ = this.c === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 0A - RRC D
        // 2  8
        // Z 0 0 C
        this.flagC = this.d & 0x01;
        this.d = (this.d >> 1) | (this.d << 7);
        this.flagZ = this.d === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 0B - RRC E
        // 2  8
        // Z 0 0 C
        this.flagC = this.e & 0x01;
        this.e = (this.e >> 1) | (this.e << 7);
        this.flagZ = this.e === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 0C - RRC H
        // 2  8
        // Z 0 0 C
        this.flagC = this.h & 0x01;
        this.h = (this.h >> 1) | (this.h << 7);
        this.flagZ = this.h === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 0D - RRC L
        // 2  8
        // Z 0 0 C
        this.flagC = this.l & 0x01;
        this.l = (this.l >> 1) | (this.l << 7);
        this.flagZ = this.l === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 0E - RRC (HL)
        // 2  16
        // Z 0 0 C
        const x = this.mmu.get(this.hl);
        this.flagC = x & 0x01;
        this.mmu.set(this.hl, (x >> 1) | (x << 7));
        this.flagZ = x === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 0F - RRC A
        // 2  8
        // Z 0 0 C
        this.flagC = this.a & 0x01;
        this.a = (this.a >> 1) | (this.a << 7);
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 10 - RL B
        // 2  8
        // Z 0 0 C
        const r = (this.b << 1) | this.flagC;
        this.flagC = r & 0x100;
        this.b = r;
        this.flagZ = this.b === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 11 - RL C
        // 2  8
        // Z 0 0 C
        const r = (this.c << 1) | this.flagC;
        this.flagC = r & 0x100;
        this.c = r;
        this.flagZ = this.c === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 12 - RL D
        // 2  8
        // Z 0 0 C
        const r = (this.d << 1) | this.flagC;
        this.flagC = r & 0x100;
        this.d = r;
        this.flagZ = this.d === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 13 - RL E
        // 2  8
        // Z 0 0 C
        const r = (this.e << 1) | this.flagC;
        this.flagC = r & 0x100;
        this.e = r;
        this.flagZ = this.e === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 14 - RL H
        // 2  8
        // Z 0 0 C
        const r = (this.h << 1) | this.flagC;
        this.flagC = r & 0x100;
        this.h = r;
        this.flagZ = this.h === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 15 - RL L
        // 2  8
        // Z 0 0 C
        const r = (this.l << 1) | this.flagC;
        this.flagC = r & 0x100;
        this.l = r;
        this.flagZ = this.l === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 16 - RL (HL)
        // 2  16
        // Z 0 0 C
        const r = (this.mmu.get(this.hl) << 1) | this.flagC;
        this.flagC = r & 0x100;
        this.mmu.set(this.hl, r);
        this.flagZ = (r & 0xff) === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 17 - RL A
        // 2  8
        // Z 0 0 C
        const r = (this.a << 1) | this.flagC;
        this.flagC = r & 0x100;
        this.a = r;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 18 - RR B
        // 2  8
        // Z 0 0 C
        const d0 = this.b & 0x01;
        this.b = (this.b >> 1) | (this.flagC << 7);
        this.flagZ = this.b === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = d0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 19 - RR C
        // 2  8
        // Z 0 0 C
        const d0 = this.c & 0x01;
        this.c = (this.c >> 1) | (this.flagC << 7);
        this.flagZ = this.c === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = d0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 1A - RR D
        // 2  8
        // Z 0 0 C
        const d0 = this.d & 0x01;
        this.d = (this.d >> 1) | (this.flagC << 7);
        this.flagZ = this.d === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = d0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 1B - RR E
        // 2  8
        // Z 0 0 C
        const d0 = this.e & 0x01;
        this.e = (this.e >> 1) | (this.flagC << 7);
        this.flagZ = this.e === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = d0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 1C - RR H
        // 2  8
        // Z 0 0 C
        const d0 = this.h & 0x01;
        this.h = (this.h >> 1) | (this.flagC << 7);
        this.flagZ = this.h === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = d0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 1D - RR L
        // 2  8
        // Z 0 0 C
        const d0 = this.l & 0x01;
        this.l = (this.l >> 1) | (this.flagC << 7);
        this.flagZ = this.l === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = d0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 1E - RR (HL)
        // 2  16
        // Z 0 0 C
        const x = this.mmu.get(this.hl);
        const d0 = x & 0x01;
        const r = (x >> 1) | (this.flagC << 7);
        this.mmu.set(this.hl, r);
        this.flagZ = (x & 0xff) === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = d0;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 1F - RR A
        // 2  8
        // Z 0 0 C
        const d0 = this.a & 0x01;
        this.a = (this.a >> 1) | (this.flagC << 7);
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = d0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 20 - SLA B
        // 2  8
        // Z 0 0 C
        this.flagC = this.b & 0x80;
        this.b = this.b << 1;
        this.flagZ = this.b === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 21 - SLA C
        // 2  8
        // Z 0 0 C
        this.flagC = this.c & 0x80;
        this.c = this.c << 1;
        this.flagZ = this.c === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 22 - SLA D
        // 2  8
        // Z 0 0 C
        this.flagC = this.d & 0x80;
        this.d = this.d << 1;
        this.flagZ = this.d === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 23 - SLA E
        // 2  8
        // Z 0 0 C
        this.flagC = this.e & 0x80;
        this.e = this.e << 1;
        this.flagZ = this.e === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 24 - SLA H
        // 2  8
        // Z 0 0 C
        this.flagC = this.h & 0x80;
        this.h = this.h << 1;
        this.flagZ = this.h === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 25 - SLA L
        // 2  8
        // Z 0 0 C
        this.flagC = this.l & 0x80;
        this.l = this.l << 1;
        this.flagZ = this.l === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 26 - SLA (HL)
        // 2  16
        // Z 0 0 C
        const x = this.mmu.get(this.hl);
        this.flagC = x & 0x80;
        this.mmu.set(this.hl, x << 1);
        this.flagZ = (x & 0x7f) === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 27 - SLA A
        // 2  8
        // Z 0 0 C
        this.flagC = this.a & 0x80;
        this.a = this.a << 1;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 28 - SRA B
        // 2  8
        // Z 0 0 C
        this.flagC = this.b & 0x01;
        this.b = (this.b >> 1) | (this.b & 0x80);
        this.flagZ = this.b === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 29 - SRA C
        // 2  8
        // Z 0 0 C
        this.flagC = this.c & 0x01;
        this.c = (this.c >> 1) | (this.c & 0x80);
        this.flagZ = this.c === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 2A - SRA D
        // 2  8
        // Z 0 0 C
        this.flagC = this.d & 0x01;
        this.d = (this.d >> 1) | (this.d & 0x80);
        this.flagZ = this.d === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 2B - SRA E
        // 2  8
        // Z 0 0 C
        this.flagC = this.e & 0x01;
        this.e = (this.e >> 1) | (this.e & 0x80);
        this.flagZ = this.e === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 2C - SRA H
        // 2  8
        // Z 0 0 C
        this.flagC = this.h & 0x01;
        this.h = (this.h >> 1) | (this.h & 0x80);
        this.flagZ = this.h === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 2D - SRA L
        // 2  8
        // Z 0 0 C
        this.flagC = this.l & 0x01;
        this.l = (this.l >> 1) | (this.l & 0x80);
        this.flagZ = this.l === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 2E - SRA (HL)
        // 2  16
        // Z 0 0 C
        const x = this.mmu.get(this.hl);
        this.flagC = x & 0x01;
        this.mmu.set(this.hl, (x >> 1) | (x & 0x80));
        this.flagZ = (x >> 1) === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 2F - SRA A
        // 2  8
        // Z 0 0 C
        this.flagC = this.a & 0x01;
        this.a = (this.a >> 1) | (this.a & 0x80);
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 30 - SWAP B
        // 2  8
        // Z 0 0 0
        this.b = (this.b << 4) | (this.b >> 4);
        this.flagZ = this.b === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 31 - SWAP C
        // 2  8
        // Z 0 0 0
        this.c = (this.c << 4) | (this.c >> 4);
        this.flagZ = this.c === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 32 - SWAP D
        // 2  8
        // Z 0 0 0
        this.d = (this.d << 4) | (this.d >> 4);
        this.flagZ = this.d === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 33 - SWAP E
        // 2  8
        // Z 0 0 0
        this.e = (this.e << 4) | (this.e >> 4);
        this.flagZ = this.e === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 34 - SWAP H
        // 2  8
        // Z 0 0 0
        this.h = (this.h << 4) | (this.h >> 4);
        this.flagZ = this.h === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 35 - SWAP L
        // 2  8
        // Z 0 0 0
        this.l = (this.l << 4) | (this.l >> 4);
        this.flagZ = this.l === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 36 - SWAP (HL)
        // 2  16
        // Z 0 0 0
        const x = this.mmu.get(this.hl);
        this.mmu.set(this.hl, (x << 4) | (x >> 4));
        this.flagZ = x === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 37 - SWAP A
        // 2  8
        // Z 0 0 0
        this.a = (this.a << 4) | (this.a >> 4);
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 38 - SRL B
        // 2  8
        // Z 0 0 C
        this.flagC = this.b & 0x01;
        this.b = this.b >> 1;
        this.flagZ = this.b === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 39 - SRL C
        // 2  8
        // Z 0 0 C
        this.flagC = this.c & 0x01;
        this.c = this.c >> 1;
        this.flagZ = this.c === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 3A - SRL D
        // 2  8
        // Z 0 0 C
        this.flagC = this.d & 0x01;
        this.d = this.d >> 1;
        this.flagZ = this.d === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 3B - SRL E
        // 2  8
        // Z 0 0 C
        this.flagC = this.e & 0x01;
        this.e = this.e >> 1;
        this.flagZ = this.e === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 3C - SRL H
        // 2  8
        // Z 0 0 C
        this.flagC = this.h & 0x01;
        this.h = this.h >> 1;
        this.flagZ = this.h === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 3D - SRL L
        // 2  8
        // Z 0 0 C
        this.flagC = this.l & 0x01;
        this.l = this.l >> 1;
        this.flagZ = this.l === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 3E - SRL (HL)
        // 2  16
        // Z 0 0 C
        const x = this.mmu.get(this.hl);
        this.flagC = x & 0x01;
        this.mmu.set(this.hl, x >> 1);
        this.flagZ = (x >> 1) === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 3F - SRL A
        // 2  8
        // Z 0 0 C
        this.flagC = this.a & 0x01;
        this.a = this.a >> 1;
        this.flagZ = this.a === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 40 - BIT 0,B
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.b & 0x01);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 41 - BIT 0,C
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.c & 0x01);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 42 - BIT 0,D
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.d & 0x01);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 43 - BIT 0,E
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.e & 0x01);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 44 - BIT 0,H
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.h & 0x01);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 45 - BIT 0,L
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.l & 0x01);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 46 - BIT 0,(HL)
        // 2  16
        // Z 0 1 -
        this.flagZ = !(this.mmu.get(this.hl) & 0x01);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 47 - BIT 0,A
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.a & 0x01);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 48 - BIT 1,B
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.b & 0x02);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 49 - BIT 1,C
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.c & 0x02);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 4A - BIT 1,D
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.d & 0x02);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 4B - BIT 1,E
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.e & 0x02);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 4C - BIT 1,H
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.h & 0x02);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 4D - BIT 1,L
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.l & 0x02);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 4E - BIT 1,(HL)
        // 2  16
        // Z 0 1 -
        this.flagZ = !(this.mmu.get(this.hl) & 0x02);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 4F - BIT 1,A
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.a & 0x02);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 50 - BIT 2,B
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.b & 0x04);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 51 - BIT 2,C
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.c & 0x04);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 52 - BIT 2,D
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.d & 0x04);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 53 - BIT 2,E
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.e & 0x04);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 54 - BIT 2,H
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.h & 0x04);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 55 - BIT 2,L
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.l & 0x04);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 56 - BIT 2,(HL)
        // 2  16
        // Z 0 1 -
        this.flagZ = !(this.mmu.get(this.hl) & 0x04);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 57 - BIT 2,A
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.a & 0x04);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 58 - BIT 3,B
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.b & 0x08);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 59 - BIT 3,C
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.c & 0x08);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 5A - BIT 3,D
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.d & 0x08);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 5B - BIT 3,E
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.e & 0x08);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 5C - BIT 3,H
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.h & 0x08);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 5D - BIT 3,L
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.l & 0x08);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 5E - BIT 3,(HL)
        // 2  16
        // Z 0 1 -
        this.flagZ = !(this.mmu.get(this.hl) & 0x08);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 5F - BIT 3,A
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.a & 0x08);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 60 - BIT 4,B
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.b & 0x10);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 61 - BIT 4,C
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.c & 0x10);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 62 - BIT 4,D
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.d & 0x10);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 63 - BIT 4,E
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.e & 0x10);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 64 - BIT 4,H
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.h & 0x10);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 65 - BIT 4,L
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.l & 0x10);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 66 - BIT 4,(HL)
        // 2  16
        // Z 0 1 -
        this.flagZ = !(this.mmu.get(this.hl) & 0x10);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 67 - BIT 4,A
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.a & 0x10);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 68 - BIT 5,B
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.b & 0x20);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 69 - BIT 5,C
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.c & 0x20);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 6A - BIT 5,D
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.d & 0x20);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 6B - BIT 5,E
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.e & 0x20);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 6C - BIT 5,H
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.h & 0x20);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 6D - BIT 5,L
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.l & 0x20);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 6E - BIT 5,(HL)
        // 2  16
        // Z 0 1 -
        this.flagZ = !(this.mmu.get(this.hl) & 0x20);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 6F - BIT 5,A
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.a & 0x20);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 70 - BIT 6,B
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.b & 0x40);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 71 - BIT 6,C
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.c & 0x40);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 72 - BIT 6,D
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.d & 0x40);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 73 - BIT 6,E
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.e & 0x40);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 74 - BIT 6,H
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.h & 0x40);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 75 - BIT 6,L
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.l & 0x40);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 76 - BIT 6,(HL)
        // 2  16
        // Z 0 1 -
        this.flagZ = !(this.mmu.get(this.hl) & 0x40);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 77 - BIT 6,A
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.a & 0x40);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 78 - BIT 7,B
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.b & 0x80);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 79 - BIT 7,C
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.c & 0x80);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 7A - BIT 7,D
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.d & 0x80);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 7B - BIT 7,E
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.e & 0x80);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 7C - BIT 7,H
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.h & 0x80);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 7D - BIT 7,L
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.l & 0x80);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 7E - BIT 7,(HL)
        // 2  16
        // Z 0 1 -
        this.flagZ = !(this.mmu.get(this.hl) & 0x80);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 7F - BIT 7,A
        // 2  8
        // Z 0 1 -
        this.flagZ = !(this.a & 0x80);
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 80 - RES 0,B
        // 2  8
        // - - - -
        this.b &= 0xfe;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 81 - RES 0,C
        // 2  8
        // - - - -
        this.c &= 0xfe;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 82 - RES 0,D
        // 2  8
        // - - - -
        this.d &= 0xfe;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 83 - RES 0,E
        // 2  8
        // - - - -
        this.e &= 0xfe;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 84 - RES 0,H
        // 2  8
        // - - - -
        this.h &= 0xfe;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 85 - RES 0,L
        // 2  8
        // - - - -
        this.l &= 0xfe;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 86 - RES 0,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) & 0xfe);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 87 - RES 0,A
        // 2  8
        // - - - -
        this.a &= 0xfe;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 88 - RES 1,B
        // 2  8
        // - - - -
        this.b &= 0xfd;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 89 - RES 1,C
        // 2  8
        // - - - -
        this.c &= 0xfd;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 8A - RES 1,D
        // 2  8
        // - - - -
        this.d &= 0xfd;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 8B - RES 1,E
        // 2  8
        // - - - -
        this.e &= 0xfd;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 8C - RES 1,H
        // 2  8
        // - - - -
        this.h &= 0xfd;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 8D - RES 1,L
        // 2  8
        // - - - -
        this.l &= 0xfd;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 8E - RES 1,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) & 0xfd);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 8F - RES 1,A
        // 2  8
        // - - - -
        this.a &= 0xfd;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 90 - RES 2,B
        // 2  8
        // - - - -
        this.b &= 0xfb;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 91 - RES 2,C
        // 2  8
        // - - - -
        this.c &= 0xfb;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 92 - RES 2,D
        // 2  8
        // - - - -
        this.d &= 0xfb;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 93 - RES 2,E
        // 2  8
        // - - - -
        this.e &= 0xfb;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 94 - RES 2,H
        // 2  8
        // - - - -
        this.h &= 0xfb;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 95 - RES 2,L
        // 2  8
        // - - - -
        this.l &= 0xfb;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 96 - RES 2,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) & 0xfb);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 97 - RES 2,A
        // 2  8
        // - - - -
        this.a &= 0xfb;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 98 - RES 3,B
        // 2  8
        // - - - -
        this.b &= 0xf7;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 99 - RES 3,C
        // 2  8
        // - - - -
        this.c &= 0xf7;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 9A - RES 3,D
        // 2  8
        // - - - -
        this.d &= 0xf7;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 9B - RES 3,E
        // 2  8
        // - - - -
        this.e &= 0xf7;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 9C - RES 3,H
        // 2  8
        // - - - -
        this.h &= 0xf7;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 9D - RES 3,L
        // 2  8
        // - - - -
        this.l &= 0xf7;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // 9E - RES 3,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) & 0xf7);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // 9F - RES 3,A
        // 2  8
        // - - - -
        this.a &= 0xf7;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // A0 - RES 4,B
        // 2  8
        // - - - -
        this.b &= 0xef;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // A1 - RES 4,C
        // 2  8
        // - - - -
        this.c &= 0xef;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // A2 - RES 4,D
        // 2  8
        // - - - -
        this.d &= 0xef;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // A3 - RES 4,E
        // 2  8
        // - - - -
        this.e &= 0xef;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // A4 - RES 4,H
        // 2  8
        // - - - -
        this.h &= 0xef;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // A5 - RES 4,L
        // 2  8
        // - - - -
        this.l &= 0xef;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // A6 - RES 4,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) & 0xef);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // A7 - RES 4,A
        // 2  8
        // - - - -
        this.a &= 0xef;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // A8 - RES 5,B
        // 2  8
        // - - - -
        this.b &= 0xdf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // A9 - RES 5,C
        // 2  8
        // - - - -
        this.c &= 0xdf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // AA - RES 5,D
        // 2  8
        // - - - -
        this.d &= 0xdf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // AB - RES 5,E
        // 2  8
        // - - - -
        this.e &= 0xdf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // AC - RES 5,H
        // 2  8
        // - - - -
        this.h &= 0xdf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // AD - RES 5,L
        // 2  8
        // - - - -
        this.l &= 0xdf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // AE - RES 5,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) & 0xdf);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // AF - RES 5,A
        // 2  8
        // - - - -
        this.a &= 0xdf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // B0 - RES 6,B
        // 2  8
        // - - - -
        this.b &= 0xbf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // B1 - RES 6,C
        // 2  8
        // - - - -
        this.c &= 0xbf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // B2 - RES 6,D
        // 2  8
        // - - - -
        this.d &= 0xbf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // B3 - RES 6,E
        // 2  8
        // - - - -
        this.e &= 0xbf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // B4 - RES 6,H
        // 2  8
        // - - - -
        this.h &= 0xbf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // B5 - RES 6,L
        // 2  8
        // - - - -
        this.l &= 0xbf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // B6 - RES 6,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) & 0xbf);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // B7 - RES 6,A
        // 2  8
        // - - - -
        this.a &= 0xbf;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // B8 - RES 7,B
        // 2  8
        // - - - -
        this.b &= 0x7f;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // B9 - RES 7,C
        // 2  8
        // - - - -
        this.c &= 0x7f;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // BA - RES 7,D
        // 2  8
        // - - - -
        this.d &= 0x7f;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // BB - RES 7,E
        // 2  8
        // - - - -
        this.e &= 0x7f;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // BC - RES 7,H
        // 2  8
        // - - - -
        this.h &= 0x7f;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // BD - RES 7,L
        // 2  8
        // - - - -
        this.l &= 0x7f;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // BE - RES 7,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) & 0x7f);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // BF - RES 7,A
        // 2  8
        // - - - -
        this.a &= 0x7f;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // C0 - SET 0,B
        // 2  8
        // - - - -
        this.b |= 0x01;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // C1 - SET 0,C
        // 2  8
        // - - - -
        this.c |= 0x01;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // C2 - SET 0,D
        // 2  8
        // - - - -
        this.d |= 0x01;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // C3 - SET 0,E
        // 2  8
        // - - - -
        this.e |= 0x01;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // C4 - SET 0,H
        // 2  8
        // - - - -
        this.h |= 0x01;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // C5 - SET 0,L
        // 2  8
        // - - - -
        this.l |= 0x01;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // C6 - SET 0,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) | 0x01);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // C7 - SET 0,A
        // 2  8
        // - - - -
        this.a |= 0x01;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // C8 - SET 1,B
        // 2  8
        // - - - -
        this.b |= 0x02;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // C9 - SET 1,C
        // 2  8
        // - - - -
        this.c |= 0x02;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // CA - SET 1,D
        // 2  8
        // - - - -
        this.d |= 0x02;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // CB - SET 1,E
        // 2  8
        // - - - -
        this.e |= 0x02;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // CC - SET 1,H
        // 2  8
        // - - - -
        this.h |= 0x02;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // CD - SET 1,L
        // 2  8
        // - - - -
        this.l |= 0x02;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // CE - SET 1,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) | 0x02);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // CF - SET 1,A
        // 2  8
        // - - - -
        this.a |= 0x02;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // D0 - SET 2,B
        // 2  8
        // - - - -
        this.b |= 0x04;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // D1 - SET 2,C
        // 2  8
        // - - - -
        this.c |= 0x04;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // D2 - SET 2,D
        // 2  8
        // - - - -
        this.d |= 0x04;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // D3 - SET 2,E
        // 2  8
        // - - - -
        this.e |= 0x04;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // D4 - SET 2,H
        // 2  8
        // - - - -
        this.h |= 0x04;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // D5 - SET 2,L
        // 2  8
        // - - - -
        this.l |= 0x04;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // D6 - SET 2,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) | 0x04);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // D7 - SET 2,A
        // 2  8
        // - - - -
        this.a |= 0x04;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // D8 - SET 3,B
        // 2  8
        // - - - -
        this.b |= 0x08;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // D9 - SET 3,C
        // 2  8
        // - - - -
        this.c |= 0x08;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // DA - SET 3,D
        // 2  8
        // - - - -
        this.d |= 0x08;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // DB - SET 3,E
        // 2  8
        // - - - -
        this.e |= 0x08;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // DC - SET 3,H
        // 2  8
        // - - - -
        this.h |= 0x08;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // DD - SET 3,L
        // 2  8
        // - - - -
        this.l |= 0x08;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // DE - SET 3,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) | 0x08);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // DF - SET 3,A
        // 2  8
        // - - - -
        this.a |= 0x08;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // E0 - SET 4,B
        // 2  8
        // - - - -
        this.b |= 0x10;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // E1 - SET 4,C
        // 2  8
        // - - - -
        this.c |= 0x10;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // E2 - SET 4,D
        // 2  8
        // - - - -
        this.d |= 0x10;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // E3 - SET 4,E
        // 2  8
        // - - - -
        this.e |= 0x10;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // E4 - SET 4,H
        // 2  8
        // - - - -
        this.h |= 0x10;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // E5 - SET 4,L
        // 2  8
        // - - - -
        this.l |= 0x10;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // E6 - SET 4,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) | 0x10);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // E7 - SET 4,A
        // 2  8
        // - - - -
        this.a |= 0x10;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // E8 - SET 5,B
        // 2  8
        // - - - -
        this.b |= 0x20;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // E9 - SET 5,C
        // 2  8
        // - - - -
        this.c |= 0x20;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // EA - SET 5,D
        // 2  8
        // - - - -
        this.d |= 0x20;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // EB - SET 5,E
        // 2  8
        // - - - -
        this.e |= 0x20;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // EC - SET 5,H
        // 2  8
        // - - - -
        this.h |= 0x20;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // ED - SET 5,L
        // 2  8
        // - - - -
        this.l |= 0x20;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // EE - SET 5,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) | 0x20);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // EF - SET 5,A
        // 2  8
        // - - - -
        this.a |= 0x20;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // F0 - SET 6,B
        // 2  8
        // - - - -
        this.b |= 0x40;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // F1 - SET 6,C
        // 2  8
        // - - - -
        this.c |= 0x40;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // F2 - SET 6,D
        // 2  8
        // - - - -
        this.d |= 0x40;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // F3 - SET 6,E
        // 2  8
        // - - - -
        this.e |= 0x40;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // F4 - SET 6,H
        // 2  8
        // - - - -
        this.h |= 0x40;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // F5 - SET 6,L
        // 2  8
        // - - - -
        this.l |= 0x40;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // F6 - SET 6,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) | 0x40);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // F7 - SET 6,A
        // 2  8
        // - - - -
        this.a |= 0x40;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // F8 - SET 7,B
        // 2  8
        // - - - -
        this.b |= 0x80;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // F9 - SET 7,C
        // 2  8
        // - - - -
        this.c |= 0x80;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // FA - SET 7,D
        // 2  8
        // - - - -
        this.d |= 0x80;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // FB - SET 7,E
        // 2  8
        // - - - -
        this.e |= 0x80;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // FC - SET 7,H
        // 2  8
        // - - - -
        this.h |= 0x80;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // FD - SET 7,L
        // 2  8
        // - - - -
        this.l |= 0x80;
        this.pc += 2;
        this.clock += 8;
    },
    function () {
        // FE - SET 7,(HL)
        // 2  16
        // - - - -
        this.mmu.set(this.hl, this.mmu.get(this.hl) | 0x80);
        this.pc += 2;
        this.clock += 16;
    },
    function () {
        // FF - SET 7,A
        // 2  8
        // - - - -
        this.a |= 0x80;
        this.pc += 2;
        this.clock += 8;
    },
];

const asmCodes = [["NOP", "1  4", "- - - -"],["LD BC,d16", "3  12", "- - - -"],["LD (BC),A", "1  8", "- - - -"],["INC BC", "1  8", "- - - -"],["INC B", "1  4", "Z 0 H -"],["DEC B", "1  4", "Z 1 H -"],["LD B,d8", "2  8", "- - - -"],["RLCA", "1  4", "0 0 0 C"],["LD (a16),SP", "3  20", "- - - -"],["ADD HL,BC", "1  8", "- 0 H C"],["LD A,(BC)", "1  8", "- - - -"],["DEC BC", "1  8", "- - - -"],["INC C", "1  4", "Z 0 H -"],["DEC C", "1  4", "Z 1 H -"],["LD C,d8", "2  8", "- - - -"],["RRCA", "1  4", "0 0 0 C"],["STOP 0", "2  4", "- - - -"],["LD DE,d16", "3  12", "- - - -"],["LD (DE),A", "1  8", "- - - -"],["INC DE", "1  8", "- - - -"],["INC D", "1  4", "Z 0 H -"],["DEC D", "1  4", "Z 1 H -"],["LD D,d8", "2  8", "- - - -"],["RLA", "1  4", "0 0 0 C"],["JR r8", "2  12", "- - - -"],["ADD HL,DE", "1  8", "- 0 H C"],["LD A,(DE)", "1  8", "- - - -"],["DEC DE", "1  8", "- - - -"],["INC E", "1  4", "Z 0 H -"],["DEC E", "1  4", "Z 1 H -"],["LD E,d8", "2  8", "- - - -"],["RRA", "1  4", "0 0 0 C"],["JR NZ,r8", "2  12/8", "- - - -"],["LD HL,d16", "3  12", "- - - -"],["LD (HL+),A", "1  8", "- - - -"],["INC HL", "1  8", "- - - -"],["INC H", "1  4", "Z 0 H -"],["DEC H", "1  4", "Z 1 H -"],["LD H,d8", "2  8", "- - - -"],["DAA", "1  4", "Z - 0 C"],["JR Z,r8", "2  12/8", "- - - -"],["ADD HL,HL", "1  8", "- 0 H C"],["LD A,(HL+)", "1  8", "- - - -"],["DEC HL", "1  8", "- - - -"],["INC L", "1  4", "Z 0 H -"],["DEC L", "1  4", "Z 1 H -"],["LD L,d8", "2  8", "- - - -"],["CPL", "1  4", "- 1 1 -"],["JR NC,r8", "2  12/8", "- - - -"],["LD SP,d16", "3  12", "- - - -"],["LD (HL-),A", "1  8", "- - - -"],["INC SP", "1  8", "- - - -"],["INC (HL)", "1  12", "Z 0 H -"],["DEC (HL)", "1  12", "Z 1 H -"],["LD (HL),d8", "2  12", "- - - -"],["SCF", "1  4", "- 0 0 1"],["JR C,r8", "2  12/8", "- - - -"],["ADD HL,SP", "1  8", "- 0 H C"],["LD A,(HL-)", "1  8", "- - - -"],["DEC SP", "1  8", "- - - -"],["INC A", "1  4", "Z 0 H -"],["DEC A", "1  4", "Z 1 H -"],["LD A,d8", "2  8", "- - - -"],["CCF", "1  4", "- 0 0 C"],["LD B,B", "1  4", "- - - -"],["LD B,C", "1  4", "- - - -"],["LD B,D", "1  4", "- - - -"],["LD B,E", "1  4", "- - - -"],["LD B,H", "1  4", "- - - -"],["LD B,L", "1  4", "- - - -"],["LD B,(HL)", "1  8", "- - - -"],["LD B,A", "1  4", "- - - -"],["LD C,B", "1  4", "- - - -"],["LD C,C", "1  4", "- - - -"],["LD C,D", "1  4", "- - - -"],["LD C,E", "1  4", "- - - -"],["LD C,H", "1  4", "- - - -"],["LD C,L", "1  4", "- - - -"],["LD C,(HL)", "1  8", "- - - -"],["LD C,A", "1  4", "- - - -"],["LD D,B", "1  4", "- - - -"],["LD D,C", "1  4", "- - - -"],["LD D,D", "1  4", "- - - -"],["LD D,E", "1  4", "- - - -"],["LD D,H", "1  4", "- - - -"],["LD D,L", "1  4", "- - - -"],["LD D,(HL)", "1  8", "- - - -"],["LD D,A", "1  4", "- - - -"],["LD E,B", "1  4", "- - - -"],["LD E,C", "1  4", "- - - -"],["LD E,D", "1  4", "- - - -"],["LD E,E", "1  4", "- - - -"],["LD E,H", "1  4", "- - - -"],["LD E,L", "1  4", "- - - -"],["LD E,(HL)", "1  8", "- - - -"],["LD E,A", "1  4", "- - - -"],["LD H,B", "1  4", "- - - -"],["LD H,C", "1  4", "- - - -"],["LD H,D", "1  4", "- - - -"],["LD H,E", "1  4", "- - - -"],["LD H,H", "1  4", "- - - -"],["LD H,L", "1  4", "- - - -"],["LD H,(HL)", "1  8", "- - - -"],["LD H,A", "1  4", "- - - -"],["LD L,B", "1  4", "- - - -"],["LD L,C", "1  4", "- - - -"],["LD L,D", "1  4", "- - - -"],["LD L,E", "1  4", "- - - -"],["LD L,H", "1  4", "- - - -"],["LD L,L", "1  4", "- - - -"],["LD L,(HL)", "1  8", "- - - -"],["LD L,A", "1  4", "- - - -"],["LD (HL),B", "1  8", "- - - -"],["LD (HL),C", "1  8", "- - - -"],["LD (HL),D", "1  8", "- - - -"],["LD (HL),E", "1  8", "- - - -"],["LD (HL),H", "1  8", "- - - -"],["LD (HL),L", "1  8", "- - - -"],["HALT", "1  4", "- - - -"],["LD (HL),A", "1  8", "- - - -"],["LD A,B", "1  4", "- - - -"],["LD A,C", "1  4", "- - - -"],["LD A,D", "1  4", "- - - -"],["LD A,E", "1  4", "- - - -"],["LD A,H", "1  4", "- - - -"],["LD A,L", "1  4", "- - - -"],["LD A,(HL)", "1  8", "- - - -"],["LD A,A", "1  4", "- - - -"],["ADD A,B", "1  4", "Z 0 H C"],["ADD A,C", "1  4", "Z 0 H C"],["ADD A,D", "1  4", "Z 0 H C"],["ADD A,E", "1  4", "Z 0 H C"],["ADD A,H", "1  4", "Z 0 H C"],["ADD A,L", "1  4", "Z 0 H C"],["ADD A,(HL)", "1  8", "Z 0 H C"],["ADD A,A", "1  4", "Z 0 H C"],["ADC A,B", "1  4", "Z 0 H C"],["ADC A,C", "1  4", "Z 0 H C"],["ADC A,D", "1  4", "Z 0 H C"],["ADC A,E", "1  4", "Z 0 H C"],["ADC A,H", "1  4", "Z 0 H C"],["ADC A,L", "1  4", "Z 0 H C"],["ADC A,(HL)", "1  8", "Z 0 H C"],["ADC A,A", "1  4", "Z 0 H C"],["SUB B", "1  4", "Z 1 H C"],["SUB C", "1  4", "Z 1 H C"],["SUB D", "1  4", "Z 1 H C"],["SUB E", "1  4", "Z 1 H C"],["SUB H", "1  4", "Z 1 H C"],["SUB L", "1  4", "Z 1 H C"],["SUB (HL)", "1  8", "Z 1 H C"],["SUB A", "1  4", "Z 1 H C"],["SBC A,B", "1  4", "Z 1 H C"],["SBC A,C", "1  4", "Z 1 H C"],["SBC A,D", "1  4", "Z 1 H C"],["SBC A,E", "1  4", "Z 1 H C"],["SBC A,H", "1  4", "Z 1 H C"],["SBC A,L", "1  4", "Z 1 H C"],["SBC A,(HL)", "1  8", "Z 1 H C"],["SBC A,A", "1  4", "Z 1 H C"],["AND B", "1  4", "Z 0 1 0"],["AND C", "1  4", "Z 0 1 0"],["AND D", "1  4", "Z 0 1 0"],["AND E", "1  4", "Z 0 1 0"],["AND H", "1  4", "Z 0 1 0"],["AND L", "1  4", "Z 0 1 0"],["AND (HL)", "1  8", "Z 0 1 0"],["AND A", "1  4", "Z 0 1 0"],["XOR B", "1  4", "Z 0 0 0"],["XOR C", "1  4", "Z 0 0 0"],["XOR D", "1  4", "Z 0 0 0"],["XOR E", "1  4", "Z 0 0 0"],["XOR H", "1  4", "Z 0 0 0"],["XOR L", "1  4", "Z 0 0 0"],["XOR (HL)", "1  8", "Z 0 0 0"],["XOR A", "1  4", "Z 0 0 0"],["OR B", "1  4", "Z 0 0 0"],["OR C", "1  4", "Z 0 0 0"],["OR D", "1  4", "Z 0 0 0"],["OR E", "1  4", "Z 0 0 0"],["OR H", "1  4", "Z 0 0 0"],["OR L", "1  4", "Z 0 0 0"],["OR (HL)", "1  8", "Z 0 0 0"],["OR A", "1  4", "Z 0 0 0"],["CP B", "1  4", "Z 1 H C"],["CP C", "1  4", "Z 1 H C"],["CP D", "1  4", "Z 1 H C"],["CP E", "1  4", "Z 1 H C"],["CP H", "1  4", "Z 1 H C"],["CP L", "1  4", "Z 1 H C"],["CP (HL)", "1  8", "Z 1 H C"],["CP A", "1  4", "Z 1 H C"],["RET NZ", "1  20/8", "- - - -"],["POP BC", "1  12", "- - - -"],["JP NZ,a16", "3  16/12", "- - - -"],["JP a16", "3  16", "- - - -"],["CALL NZ,a16", "3  24/12", "- - - -"],["PUSH BC", "1  16", "- - - -"],["ADD A,d8", "2  8", "Z 0 H C"],["RST 00H", "1  16", "- - - -"],["RET Z", "1  20/8", "- - - -"],["RET", "1  16", "- - - -"],["JP Z,a16", "3  16/12", "- - - -"],["PREFIX CB", "1  4", "- - - -"],["CALL Z,a16", "3  24/12", "- - - -"],["CALL a16", "3  24", "- - - -"],["ADC A,d8", "2  8", "Z 0 H C"],["RST 08H", "1  16", "- - - -"],["RET NC", "1  20/8", "- - - -"],["POP DE", "1  12", "- - - -"],["JP NC,a16", "3  16/12", "- - - -"],["ERR", "1  0", "- - - -"],["CALL NC,a16", "3  24/12", "- - - -"],["PUSH DE", "1  16", "- - - -"],["SUB d8", "2  8", "Z 1 H C"],["RST 10H", "1  16", "- - - -"],["RET C", "1  20/8", "- - - -"],["RETI", "1  16", "- - - -"],["JP C,a16", "3  16/12", "- - - -"],["ERR", "1  0", "- - - -"],["CALL C,a16", "3  24/12", "- - - -"],["ERR", "1  0", "- - - -"],["SBC A,d8", "2  8", "Z 1 H C"],["RST 18H", "1  16", "- - - -"],["LDH (a8),A", "2  12", "- - - -"],["POP HL", "1  12", "- - - -"],["LD (C),A", "1  8", "- - - -"],["ERR", "1  0", "- - - -"],["ERR", "1  0", "- - - -"],["PUSH HL", "1  16", "- - - -"],["AND d8", "2  8", "Z 0 1 0"],["RST 20H", "1  16", "- - - -"],["ADD SP,r8", "2  16", "0 0 H C"],["JP (HL)", "1  4", "- - - -"],["LD (a16),A", "3  16", "- - - -"],["ERR", "1  0", "- - - -"],["ERR", "1  0", "- - - -"],["ERR", "1  0", "- - - -"],["XOR d8", "2  8", "Z 0 0 0"],["RST 28H", "1  16", "- - - -"],["LDH A,(a8)", "2  12", "- - - -"],["POP AF", "1  12", "Z N H C"],["LD A,(C)", "1  8", "- - - -"],["DI", "1  4", "- - - -"],["ERR", "1  0", "- - - -"],["PUSH AF", "1  16", "- - - -"],["OR d8", "2  8", "Z 0 0 0"],["RST 30H", "1  16", "- - - -"],["LD HL,SP+r8", "2  12", "0 0 H C"],["LD SP,HL", "1  8", "- - - -"],["LD A,(a16)", "3  16", "- - - -"],["EI", "1  4", "- - - -"],["ERR", "1  0", "- - - -"],["ERR", "1  0", "- - - -"],["CP d8", "2  8", "Z 1 H C"],["RST 38H", "1  16", "- - - -"],];

const asmCodesCB = [["RLC B", "2  8", "Z 0 0 C"],["RLC C", "2  8", "Z 0 0 C"],["RLC D", "2  8", "Z 0 0 C"],["RLC E", "2  8", "Z 0 0 C"],["RLC H", "2  8", "Z 0 0 C"],["RLC L", "2  8", "Z 0 0 C"],["RLC (HL)", "2  16", "Z 0 0 C"],["RLC A", "2  8", "Z 0 0 C"],["RRC B", "2  8", "Z 0 0 C"],["RRC C", "2  8", "Z 0 0 C"],["RRC D", "2  8", "Z 0 0 C"],["RRC E", "2  8", "Z 0 0 C"],["RRC H", "2  8", "Z 0 0 C"],["RRC L", "2  8", "Z 0 0 C"],["RRC (HL)", "2  16", "Z 0 0 C"],["RRC A", "2  8", "Z 0 0 C"],["RL B", "2  8", "Z 0 0 C"],["RL C", "2  8", "Z 0 0 C"],["RL D", "2  8", "Z 0 0 C"],["RL E", "2  8", "Z 0 0 C"],["RL H", "2  8", "Z 0 0 C"],["RL L", "2  8", "Z 0 0 C"],["RL (HL)", "2  16", "Z 0 0 C"],["RL A", "2  8", "Z 0 0 C"],["RR B", "2  8", "Z 0 0 C"],["RR C", "2  8", "Z 0 0 C"],["RR D", "2  8", "Z 0 0 C"],["RR E", "2  8", "Z 0 0 C"],["RR H", "2  8", "Z 0 0 C"],["RR L", "2  8", "Z 0 0 C"],["RR (HL)", "2  16", "Z 0 0 C"],["RR A", "2  8", "Z 0 0 C"],["SLA B", "2  8", "Z 0 0 C"],["SLA C", "2  8", "Z 0 0 C"],["SLA D", "2  8", "Z 0 0 C"],["SLA E", "2  8", "Z 0 0 C"],["SLA H", "2  8", "Z 0 0 C"],["SLA L", "2  8", "Z 0 0 C"],["SLA (HL)", "2  16", "Z 0 0 C"],["SLA A", "2  8", "Z 0 0 C"],["SRA B", "2  8", "Z 0 0 0"],["SRA C", "2  8", "Z 0 0 0"],["SRA D", "2  8", "Z 0 0 0"],["SRA E", "2  8", "Z 0 0 0"],["SRA H", "2  8", "Z 0 0 0"],["SRA L", "2  8", "Z 0 0 0"],["SRA (HL)", "2  16", "Z 0 0 0"],["SRA A", "2  8", "Z 0 0 0"],["SWAP B", "2  8", "Z 0 0 0"],["SWAP C", "2  8", "Z 0 0 0"],["SWAP D", "2  8", "Z 0 0 0"],["SWAP E", "2  8", "Z 0 0 0"],["SWAP H", "2  8", "Z 0 0 0"],["SWAP L", "2  8", "Z 0 0 0"],["SWAP (HL)", "2  16", "Z 0 0 0"],["SWAP A", "2  8", "Z 0 0 0"],["SRL B", "2  8", "Z 0 0 C"],["SRL C", "2  8", "Z 0 0 C"],["SRL D", "2  8", "Z 0 0 C"],["SRL E", "2  8", "Z 0 0 C"],["SRL H", "2  8", "Z 0 0 C"],["SRL L", "2  8", "Z 0 0 C"],["SRL (HL)", "2  16", "Z 0 0 C"],["SRL A", "2  8", "Z 0 0 C"],["BIT 0,B", "2  8", "Z 0 1 -"],["BIT 0,C", "2  8", "Z 0 1 -"],["BIT 0,D", "2  8", "Z 0 1 -"],["BIT 0,E", "2  8", "Z 0 1 -"],["BIT 0,H", "2  8", "Z 0 1 -"],["BIT 0,L", "2  8", "Z 0 1 -"],["BIT 0,(HL)", "2  16", "Z 0 1 -"],["BIT 0,A", "2  8", "Z 0 1 -"],["BIT 1,B", "2  8", "Z 0 1 -"],["BIT 1,C", "2  8", "Z 0 1 -"],["BIT 1,D", "2  8", "Z 0 1 -"],["BIT 1,E", "2  8", "Z 0 1 -"],["BIT 1,H", "2  8", "Z 0 1 -"],["BIT 1,L", "2  8", "Z 0 1 -"],["BIT 1,(HL)", "2  16", "Z 0 1 -"],["BIT 1,A", "2  8", "Z 0 1 -"],["BIT 2,B", "2  8", "Z 0 1 -"],["BIT 2,C", "2  8", "Z 0 1 -"],["BIT 2,D", "2  8", "Z 0 1 -"],["BIT 2,E", "2  8", "Z 0 1 -"],["BIT 2,H", "2  8", "Z 0 1 -"],["BIT 2,L", "2  8", "Z 0 1 -"],["BIT 2,(HL)", "2  16", "Z 0 1 -"],["BIT 2,A", "2  8", "Z 0 1 -"],["BIT 3,B", "2  8", "Z 0 1 -"],["BIT 3,C", "2  8", "Z 0 1 -"],["BIT 3,D", "2  8", "Z 0 1 -"],["BIT 3,E", "2  8", "Z 0 1 -"],["BIT 3,H", "2  8", "Z 0 1 -"],["BIT 3,L", "2  8", "Z 0 1 -"],["BIT 3,(HL)", "2  16", "Z 0 1 -"],["BIT 3,A", "2  8", "Z 0 1 -"],["BIT 4,B", "2  8", "Z 0 1 -"],["BIT 4,C", "2  8", "Z 0 1 -"],["BIT 4,D", "2  8", "Z 0 1 -"],["BIT 4,E", "2  8", "Z 0 1 -"],["BIT 4,H", "2  8", "Z 0 1 -"],["BIT 4,L", "2  8", "Z 0 1 -"],["BIT 4,(HL)", "2  16", "Z 0 1 -"],["BIT 4,A", "2  8", "Z 0 1 -"],["BIT 5,B", "2  8", "Z 0 1 -"],["BIT 5,C", "2  8", "Z 0 1 -"],["BIT 5,D", "2  8", "Z 0 1 -"],["BIT 5,E", "2  8", "Z 0 1 -"],["BIT 5,H", "2  8", "Z 0 1 -"],["BIT 5,L", "2  8", "Z 0 1 -"],["BIT 5,(HL)", "2  16", "Z 0 1 -"],["BIT 5,A", "2  8", "Z 0 1 -"],["BIT 6,B", "2  8", "Z 0 1 -"],["BIT 6,C", "2  8", "Z 0 1 -"],["BIT 6,D", "2  8", "Z 0 1 -"],["BIT 6,E", "2  8", "Z 0 1 -"],["BIT 6,H", "2  8", "Z 0 1 -"],["BIT 6,L", "2  8", "Z 0 1 -"],["BIT 6,(HL)", "2  16", "Z 0 1 -"],["BIT 6,A", "2  8", "Z 0 1 -"],["BIT 7,B", "2  8", "Z 0 1 -"],["BIT 7,C", "2  8", "Z 0 1 -"],["BIT 7,D", "2  8", "Z 0 1 -"],["BIT 7,E", "2  8", "Z 0 1 -"],["BIT 7,H", "2  8", "Z 0 1 -"],["BIT 7,L", "2  8", "Z 0 1 -"],["BIT 7,(HL)", "2  16", "Z 0 1 -"],["BIT 7,A", "2  8", "Z 0 1 -"],["RES 0,B", "2  8", "- - - -"],["RES 0,C", "2  8", "- - - -"],["RES 0,D", "2  8", "- - - -"],["RES 0,E", "2  8", "- - - -"],["RES 0,H", "2  8", "- - - -"],["RES 0,L", "2  8", "- - - -"],["RES 0,(HL)", "2  16", "- - - -"],["RES 0,A", "2  8", "- - - -"],["RES 1,B", "2  8", "- - - -"],["RES 1,C", "2  8", "- - - -"],["RES 1,D", "2  8", "- - - -"],["RES 1,E", "2  8", "- - - -"],["RES 1,H", "2  8", "- - - -"],["RES 1,L", "2  8", "- - - -"],["RES 1,(HL)", "2  16", "- - - -"],["RES 1,A", "2  8", "- - - -"],["RES 2,B", "2  8", "- - - -"],["RES 2,C", "2  8", "- - - -"],["RES 2,D", "2  8", "- - - -"],["RES 2,E", "2  8", "- - - -"],["RES 2,H", "2  8", "- - - -"],["RES 2,L", "2  8", "- - - -"],["RES 2,(HL)", "2  16", "- - - -"],["RES 2,A", "2  8", "- - - -"],["RES 3,B", "2  8", "- - - -"],["RES 3,C", "2  8", "- - - -"],["RES 3,D", "2  8", "- - - -"],["RES 3,E", "2  8", "- - - -"],["RES 3,H", "2  8", "- - - -"],["RES 3,L", "2  8", "- - - -"],["RES 3,(HL)", "2  16", "- - - -"],["RES 3,A", "2  8", "- - - -"],["RES 4,B", "2  8", "- - - -"],["RES 4,C", "2  8", "- - - -"],["RES 4,D", "2  8", "- - - -"],["RES 4,E", "2  8", "- - - -"],["RES 4,H", "2  8", "- - - -"],["RES 4,L", "2  8", "- - - -"],["RES 4,(HL)", "2  16", "- - - -"],["RES 4,A", "2  8", "- - - -"],["RES 5,B", "2  8", "- - - -"],["RES 5,C", "2  8", "- - - -"],["RES 5,D", "2  8", "- - - -"],["RES 5,E", "2  8", "- - - -"],["RES 5,H", "2  8", "- - - -"],["RES 5,L", "2  8", "- - - -"],["RES 5,(HL)", "2  16", "- - - -"],["RES 5,A", "2  8", "- - - -"],["RES 6,B", "2  8", "- - - -"],["RES 6,C", "2  8", "- - - -"],["RES 6,D", "2  8", "- - - -"],["RES 6,E", "2  8", "- - - -"],["RES 6,H", "2  8", "- - - -"],["RES 6,L", "2  8", "- - - -"],["RES 6,(HL)", "2  16", "- - - -"],["RES 6,A", "2  8", "- - - -"],["RES 7,B", "2  8", "- - - -"],["RES 7,C", "2  8", "- - - -"],["RES 7,D", "2  8", "- - - -"],["RES 7,E", "2  8", "- - - -"],["RES 7,H", "2  8", "- - - -"],["RES 7,L", "2  8", "- - - -"],["RES 7,(HL)", "2  16", "- - - -"],["RES 7,A", "2  8", "- - - -"],["SET 0,B", "2  8", "- - - -"],["SET 0,C", "2  8", "- - - -"],["SET 0,D", "2  8", "- - - -"],["SET 0,E", "2  8", "- - - -"],["SET 0,H", "2  8", "- - - -"],["SET 0,L", "2  8", "- - - -"],["SET 0,(HL)", "2  16", "- - - -"],["SET 0,A", "2  8", "- - - -"],["SET 1,B", "2  8", "- - - -"],["SET 1,C", "2  8", "- - - -"],["SET 1,D", "2  8", "- - - -"],["SET 1,E", "2  8", "- - - -"],["SET 1,H", "2  8", "- - - -"],["SET 1,L", "2  8", "- - - -"],["SET 1,(HL)", "2  16", "- - - -"],["SET 1,A", "2  8", "- - - -"],["SET 2,B", "2  8", "- - - -"],["SET 2,C", "2  8", "- - - -"],["SET 2,D", "2  8", "- - - -"],["SET 2,E", "2  8", "- - - -"],["SET 2,H", "2  8", "- - - -"],["SET 2,L", "2  8", "- - - -"],["SET 2,(HL)", "2  16", "- - - -"],["SET 2,A", "2  8", "- - - -"],["SET 3,B", "2  8", "- - - -"],["SET 3,C", "2  8", "- - - -"],["SET 3,D", "2  8", "- - - -"],["SET 3,E", "2  8", "- - - -"],["SET 3,H", "2  8", "- - - -"],["SET 3,L", "2  8", "- - - -"],["SET 3,(HL)", "2  16", "- - - -"],["SET 3,A", "2  8", "- - - -"],["SET 4,B", "2  8", "- - - -"],["SET 4,C", "2  8", "- - - -"],["SET 4,D", "2  8", "- - - -"],["SET 4,E", "2  8", "- - - -"],["SET 4,H", "2  8", "- - - -"],["SET 4,L", "2  8", "- - - -"],["SET 4,(HL)", "2  16", "- - - -"],["SET 4,A", "2  8", "- - - -"],["SET 5,B", "2  8", "- - - -"],["SET 5,C", "2  8", "- - - -"],["SET 5,D", "2  8", "- - - -"],["SET 5,E", "2  8", "- - - -"],["SET 5,H", "2  8", "- - - -"],["SET 5,L", "2  8", "- - - -"],["SET 5,(HL)", "2  16", "- - - -"],["SET 5,A", "2  8", "- - - -"],["SET 6,B", "2  8", "- - - -"],["SET 6,C", "2  8", "- - - -"],["SET 6,D", "2  8", "- - - -"],["SET 6,E", "2  8", "- - - -"],["SET 6,H", "2  8", "- - - -"],["SET 6,L", "2  8", "- - - -"],["SET 6,(HL)", "2  16", "- - - -"],["SET 6,A", "2  8", "- - - -"],["SET 7,B", "2  8", "- - - -"],["SET 7,C", "2  8", "- - - -"],["SET 7,D", "2  8", "- - - -"],["SET 7,E", "2  8", "- - - -"],["SET 7,H", "2  8", "- - - -"],["SET 7,L", "2  8", "- - - -"],["SET 7,(HL)", "2  16", "- - - -"],["SET 7,A", "2  8", "- - - -"],];

export {
    opCodes,
    opCodesCB,
    asmCodes,
    asmCodesCB,
};