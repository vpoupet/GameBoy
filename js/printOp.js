function hex(n, length=4) {
    return "0x" + ("0000" + n.toString(16)).substr(-length);
}

assemblyCode = [
        function () {
            return `${hex(this.pc)} - NOP`;
        },
        function () {
            return `${hex(this.pc)} - LD BC,d16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - LD (BC),A`;
        },
        function () {
            return `${hex(this.pc)} - INC BC`;
        },
        function () {
            return `${hex(this.pc)} - INC B`;
        },
        function () {
            return `${hex(this.pc)} - DEC B`;
        },
        function () {
            return `${hex(this.pc)} - LD B,d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - RLCA`;
        },
        function () {
            return `${hex(this.pc)} - LD (a16),SP, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - ADD HL,BC`;
        },
        function () {
            return `${hex(this.pc)} - LD A,(BC)`;
        },
        function () {
            return `${hex(this.pc)} - DEC BC`;
        },
        function () {
            return `${hex(this.pc)} - INC C`;
        },
        function () {
            return `${hex(this.pc)} - DEC C`;
        },
        function () {
            return `${hex(this.pc)} - LD C,d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - RRCA`;
        },
        function () {
            return `${hex(this.pc)} - STOP 0, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - LD DE,d16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - LD (DE),A`;
        },
        function () {
            return `${hex(this.pc)} - INC DE`;
        },
        function () {
            return `${hex(this.pc)} - INC D`;
        },
        function () {
            return `${hex(this.pc)} - DEC D`;
        },
        function () {
            return `${hex(this.pc)} - LD D,d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - RLA`;
        },
        function () {
            return `${hex(this.pc)} - JR r8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - ADD HL,DE`;
        },
        function () {
            return `${hex(this.pc)} - LD A,(DE)`;
        },
        function () {
            return `${hex(this.pc)} - DEC DE`;
        },
        function () {
            return `${hex(this.pc)} - INC E`;
        },
        function () {
            return `${hex(this.pc)} - DEC E`;
        },
        function () {
            return `${hex(this.pc)} - LD E,d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - RRA`;
        },
        function () {
            return `${hex(this.pc)} - JR NZ,r8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - LD HL,d16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - LD (HL+),A`;
        },
        function () {
            return `${hex(this.pc)} - INC HL`;
        },
        function () {
            return `${hex(this.pc)} - INC H`;
        },
        function () {
            return `${hex(this.pc)} - DEC H`;
        },
        function () {
            return `${hex(this.pc)} - LD H,d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - DAA`;
        },
        function () {
            return `${hex(this.pc)} - JR Z,r8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - ADD HL,HL`;
        },
        function () {
            return `${hex(this.pc)} - LD A,(HL+)`;
        },
        function () {
            return `${hex(this.pc)} - DEC HL`;
        },
        function () {
            return `${hex(this.pc)} - INC L`;
        },
        function () {
            return `${hex(this.pc)} - DEC L`;
        },
        function () {
            return `${hex(this.pc)} - LD L,d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - CPL`;
        },
        function () {
            return `${hex(this.pc)} - JR NC,r8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - LD SP,d16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - LD (HL-),A`;
        },
        function () {
            return `${hex(this.pc)} - INC SP`;
        },
        function () {
            return `${hex(this.pc)} - INC (HL)`;
        },
        function () {
            return `${hex(this.pc)} - DEC (HL)`;
        },
        function () {
            return `${hex(this.pc)} - LD (HL),d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - SCF`;
        },
        function () {
            return `${hex(this.pc)} - JR C,r8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - ADD HL,SP`;
        },
        function () {
            return `${hex(this.pc)} - LD A,(HL-)`;
        },
        function () {
            return `${hex(this.pc)} - DEC SP`;
        },
        function () {
            return `${hex(this.pc)} - INC A`;
        },
        function () {
            return `${hex(this.pc)} - DEC A`;
        },
        function () {
            return `${hex(this.pc)} - LD A,d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - CCF`;
        },
        function () {
            return `${hex(this.pc)} - LD B,B`;
        },
        function () {
            return `${hex(this.pc)} - LD B,C`;
        },
        function () {
            return `${hex(this.pc)} - LD B,D`;
        },
        function () {
            return `${hex(this.pc)} - LD B,E`;
        },
        function () {
            return `${hex(this.pc)} - LD B,H`;
        },
        function () {
            return `${hex(this.pc)} - LD B,L`;
        },
        function () {
            return `${hex(this.pc)} - LD B,(HL)`;
        },
        function () {
            return `${hex(this.pc)} - LD B,A`;
        },
        function () {
            return `${hex(this.pc)} - LD C,B`;
        },
        function () {
            return `${hex(this.pc)} - LD C,C`;
        },
        function () {
            return `${hex(this.pc)} - LD C,D`;
        },
        function () {
            return `${hex(this.pc)} - LD C,E`;
        },
        function () {
            return `${hex(this.pc)} - LD C,H`;
        },
        function () {
            return `${hex(this.pc)} - LD C,L`;
        },
        function () {
            return `${hex(this.pc)} - LD C,(HL)`;
        },
        function () {
            return `${hex(this.pc)} - LD C,A`;
        },
        function () {
            return `${hex(this.pc)} - LD D,B`;
        },
        function () {
            return `${hex(this.pc)} - LD D,C`;
        },
        function () {
            return `${hex(this.pc)} - LD D,D`;
        },
        function () {
            return `${hex(this.pc)} - LD D,E`;
        },
        function () {
            return `${hex(this.pc)} - LD D,H`;
        },
        function () {
            return `${hex(this.pc)} - LD D,L`;
        },
        function () {
            return `${hex(this.pc)} - LD D,(HL)`;
        },
        function () {
            return `${hex(this.pc)} - LD D,A`;
        },
        function () {
            return `${hex(this.pc)} - LD E,B`;
        },
        function () {
            return `${hex(this.pc)} - LD E,C`;
        },
        function () {
            return `${hex(this.pc)} - LD E,D`;
        },
        function () {
            return `${hex(this.pc)} - LD E,E`;
        },
        function () {
            return `${hex(this.pc)} - LD E,H`;
        },
        function () {
            return `${hex(this.pc)} - LD E,L`;
        },
        function () {
            return `${hex(this.pc)} - LD E,(HL)`;
        },
        function () {
            return `${hex(this.pc)} - LD E,A`;
        },
        function () {
            return `${hex(this.pc)} - LD H,B`;
        },
        function () {
            return `${hex(this.pc)} - LD H,C`;
        },
        function () {
            return `${hex(this.pc)} - LD H,D`;
        },
        function () {
            return `${hex(this.pc)} - LD H,E`;
        },
        function () {
            return `${hex(this.pc)} - LD H,H`;
        },
        function () {
            return `${hex(this.pc)} - LD H,L`;
        },
        function () {
            return `${hex(this.pc)} - LD H,(HL)`;
        },
        function () {
            return `${hex(this.pc)} - LD H,A`;
        },
        function () {
            return `${hex(this.pc)} - LD L,B`;
        },
        function () {
            return `${hex(this.pc)} - LD L,C`;
        },
        function () {
            return `${hex(this.pc)} - LD L,D`;
        },
        function () {
            return `${hex(this.pc)} - LD L,E`;
        },
        function () {
            return `${hex(this.pc)} - LD L,H`;
        },
        function () {
            return `${hex(this.pc)} - LD L,L`;
        },
        function () {
            return `${hex(this.pc)} - LD L,(HL)`;
        },
        function () {
            return `${hex(this.pc)} - LD L,A`;
        },
        function () {
            return `${hex(this.pc)} - LD (HL),B`;
        },
        function () {
            return `${hex(this.pc)} - LD (HL),C`;
        },
        function () {
            return `${hex(this.pc)} - LD (HL),D`;
        },
        function () {
            return `${hex(this.pc)} - LD (HL),E`;
        },
        function () {
            return `${hex(this.pc)} - LD (HL),H`;
        },
        function () {
            return `${hex(this.pc)} - LD (HL),L`;
        },
        function () {
            return `${hex(this.pc)} - HALT`;
        },
        function () {
            return `${hex(this.pc)} - LD (HL),A`;
        },
        function () {
            return `${hex(this.pc)} - LD A,B`;
        },
        function () {
            return `${hex(this.pc)} - LD A,C`;
        },
        function () {
            return `${hex(this.pc)} - LD A,D`;
        },
        function () {
            return `${hex(this.pc)} - LD A,E`;
        },
        function () {
            return `${hex(this.pc)} - LD A,H`;
        },
        function () {
            return `${hex(this.pc)} - LD A,L`;
        },
        function () {
            return `${hex(this.pc)} - LD A,(HL)`;
        },
        function () {
            return `${hex(this.pc)} - LD A,A`;
        },
        function () {
            return `${hex(this.pc)} - ADD A,B`;
        },
        function () {
            return `${hex(this.pc)} - ADD A,C`;
        },
        function () {
            return `${hex(this.pc)} - ADD A,D`;
        },
        function () {
            return `${hex(this.pc)} - ADD A,E`;
        },
        function () {
            return `${hex(this.pc)} - ADD A,H`;
        },
        function () {
            return `${hex(this.pc)} - ADD A,L`;
        },
        function () {
            return `${hex(this.pc)} - ADD A,(HL)`;
        },
        function () {
            return `${hex(this.pc)} - ADD A,A`;
        },
        function () {
            return `${hex(this.pc)} - ADC A,B`;
        },
        function () {
            return `${hex(this.pc)} - ADC A,C`;
        },
        function () {
            return `${hex(this.pc)} - ADC A,D`;
        },
        function () {
            return `${hex(this.pc)} - ADC A,E`;
        },
        function () {
            return `${hex(this.pc)} - ADC A,H`;
        },
        function () {
            return `${hex(this.pc)} - ADC A,L`;
        },
        function () {
            return `${hex(this.pc)} - ADC A,(HL)`;
        },
        function () {
            return `${hex(this.pc)} - ADC A,A`;
        },
        function () {
            return `${hex(this.pc)} - SUB B`;
        },
        function () {
            return `${hex(this.pc)} - SUB C`;
        },
        function () {
            return `${hex(this.pc)} - SUB D`;
        },
        function () {
            return `${hex(this.pc)} - SUB E`;
        },
        function () {
            return `${hex(this.pc)} - SUB H`;
        },
        function () {
            return `${hex(this.pc)} - SUB L`;
        },
        function () {
            return `${hex(this.pc)} - SUB (HL)`;
        },
        function () {
            return `${hex(this.pc)} - SUB A`;
        },
        function () {
            return `${hex(this.pc)} - SBC A,B`;
        },
        function () {
            return `${hex(this.pc)} - SBC A,C`;
        },
        function () {
            return `${hex(this.pc)} - SBC A,D`;
        },
        function () {
            return `${hex(this.pc)} - SBC A,E`;
        },
        function () {
            return `${hex(this.pc)} - SBC A,H`;
        },
        function () {
            return `${hex(this.pc)} - SBC A,L`;
        },
        function () {
            return `${hex(this.pc)} - SBC A,(HL)`;
        },
        function () {
            return `${hex(this.pc)} - SBC A,A`;
        },
        function () {
            return `${hex(this.pc)} - AND B`;
        },
        function () {
            return `${hex(this.pc)} - AND C`;
        },
        function () {
            return `${hex(this.pc)} - AND D`;
        },
        function () {
            return `${hex(this.pc)} - AND E`;
        },
        function () {
            return `${hex(this.pc)} - AND H`;
        },
        function () {
            return `${hex(this.pc)} - AND L`;
        },
        function () {
            return `${hex(this.pc)} - AND (HL)`;
        },
        function () {
            return `${hex(this.pc)} - AND A`;
        },
        function () {
            return `${hex(this.pc)} - XOR B`;
        },
        function () {
            return `${hex(this.pc)} - XOR C`;
        },
        function () {
            return `${hex(this.pc)} - XOR D`;
        },
        function () {
            return `${hex(this.pc)} - XOR E`;
        },
        function () {
            return `${hex(this.pc)} - XOR H`;
        },
        function () {
            return `${hex(this.pc)} - XOR L`;
        },
        function () {
            return `${hex(this.pc)} - XOR (HL)`;
        },
        function () {
            return `${hex(this.pc)} - XOR A`;
        },
        function () {
            return `${hex(this.pc)} - OR B`;
        },
        function () {
            return `${hex(this.pc)} - OR C`;
        },
        function () {
            return `${hex(this.pc)} - OR D`;
        },
        function () {
            return `${hex(this.pc)} - OR E`;
        },
        function () {
            return `${hex(this.pc)} - OR H`;
        },
        function () {
            return `${hex(this.pc)} - OR L`;
        },
        function () {
            return `${hex(this.pc)} - OR (HL)`;
        },
        function () {
            return `${hex(this.pc)} - OR A`;
        },
        function () {
            return `${hex(this.pc)} - CP B`;
        },
        function () {
            return `${hex(this.pc)} - CP C`;
        },
        function () {
            return `${hex(this.pc)} - CP D`;
        },
        function () {
            return `${hex(this.pc)} - CP E`;
        },
        function () {
            return `${hex(this.pc)} - CP H`;
        },
        function () {
            return `${hex(this.pc)} - CP L`;
        },
        function () {
            return `${hex(this.pc)} - CP (HL)`;
        },
        function () {
            return `${hex(this.pc)} - CP A`;
        },
        function () {
            return `${hex(this.pc)} - RET NZ`;
        },
        function () {
            return `${hex(this.pc)} - POP BC`;
        },
        function () {
            return `${hex(this.pc)} - JP NZ,a16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - JP a16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - CALL NZ,a16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - PUSH BC`;
        },
        function () {
            return `${hex(this.pc)} - ADD A,d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - RST 00H`;
        },
        function () {
            return `${hex(this.pc)} - RET Z`;
        },
        function () {
            return `${hex(this.pc)} - RET`;
        },
        function () {
            return `${hex(this.pc)} - JP Z,a16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - PREFIX CB, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - CALL Z,a16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - CALL a16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - ADC A,d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - RST 08H`;
        },
        function () {
            return `${hex(this.pc)} - RET NC`;
        },
        function () {
            return `${hex(this.pc)} - POP DE`;
        },
        function () {
            return `${hex(this.pc)} - JP NC,a16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - Invalid OpCode ! (${hex(this.mmu_get16(this.pc), 2)})`;
        },
        function () {
            return `${hex(this.pc)} - CALL NC,a16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - PUSH DE`;
        },
        function () {
            return `${hex(this.pc)} - SUB d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - RST 10H`;
        },
        function () {
            return `${hex(this.pc)} - RET C`;
        },
        function () {
            return `${hex(this.pc)} - RETI`;
        },
        function () {
            return `${hex(this.pc)} - JP C,a16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - Invalid OpCode ! (${hex(this.mmu_get16(this.pc), 2)})`;
        },
        function () {
            return `${hex(this.pc)} - CALL C,a16, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - Invalid OpCode ! (${hex(this.mmu_get16(this.pc), 2)})`;
        },
        function () {
            return `${hex(this.pc)} - SBC A,d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - RST 18H`;
        },
        function () {
            return `${hex(this.pc)} - LDH (a8),A, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - POP HL`;
        },
        function () {
            return `${hex(this.pc)} - LD (C),A`;
        },
        function () {
            return `${hex(this.pc)} - Invalid OpCode ! (${hex(this.mmu_get16(this.pc), 2)})`;
        },
        function () {
            return `${hex(this.pc)} - Invalid OpCode ! (${hex(this.mmu_get16(this.pc), 2)})`;
        },
        function () {
            return `${hex(this.pc)} - PUSH HL`;
        },
        function () {
            return `${hex(this.pc)} - AND d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - RST 20H`;
        },
        function () {
            return `${hex(this.pc)} - ADD SP,r8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - JP (HL)`;
        },
        function () {
            return `${hex(this.pc)} - LD (a16),A, ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - Invalid OpCode ! (${hex(this.mmu_get16(this.pc), 2)})`;
        },
        function () {
            return `${hex(this.pc)} - Invalid OpCode ! (${hex(this.mmu_get16(this.pc), 2)})`;
        },
        function () {
            return `${hex(this.pc)} - Invalid OpCode ! (${hex(this.mmu_get16(this.pc), 2)})`;
        },
        function () {
            return `${hex(this.pc)} - XOR d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - RST 28H`;
        },
        function () {
            return `${hex(this.pc)} - LDH A,(a8), ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - POP AF`;
        },
        function () {
            return `${hex(this.pc)} - LD A,(C)`;
        },
        function () {
            return `${hex(this.pc)} - DI`;
        },
        function () {
            return `${hex(this.pc)} - Invalid OpCode ! (${hex(this.mmu_get16(this.pc), 2)})`;
        },
        function () {
            return `${hex(this.pc)} - PUSH AF`;
        },
        function () {
            return `${hex(this.pc)} - OR d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - RST 30H`;
        },
        function () {
            return `${hex(this.pc)} - LD HL,SP+r8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - LD SP,HL`;
        },
        function () {
            return `${hex(this.pc)} - LD A,(a16), ${hex(this.mmu_get16(this.pc + 1), 4)}`;
        },
        function () {
            return `${hex(this.pc)} - EI`;
        },
        function () {
            return `${hex(this.pc)} - Invalid OpCode ! (${hex(this.mmu_get16(this.pc), 2)})`;
        },
        function () {
            return `${hex(this.pc)} - Invalid OpCode ! (${hex(this.mmu_get16(this.pc), 2)})`;
        },
        function () {
            return `${hex(this.pc)} - CP d8, ${hex(this.mmu_get(this.pc + 1), 2)}`;
        },
        function () {
            return `${hex(this.pc)} - RST 38H`;
        },
];
