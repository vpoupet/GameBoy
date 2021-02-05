def rlc():
    for i, reg in enumerate('bcdehl a'):
        code = 0x00 + i
        print(f'''\
    function () {{
        // {code:02X} - RLC {reg.upper()}
        // 2  8
        // Z 0 0 C
        this.flagC = this.{reg} & 0x80;
        this.{reg} = (this.{reg} << 1) | (this.{reg} >> 7);
        this.flagZ = this.{reg} === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
    }},''')

def rrc():
    for i, reg in enumerate('bcdehl a'):
        code = 0x08 + i
        print(f'''\
    function () {{
        // {code:02X} - RRC {reg.upper()}
        // 2  8
        // Z 0 0 C
        this.flagC = this.{reg} & 0x01;
        this.{reg} = (this.{reg} >> 1) | (this.{reg} << 7);
        this.flagZ = this.{reg} === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
        }},''')

def rl():
    for i, reg in enumerate('bcdehl a'):
        code = 0x10 + i
        print(f'''\
    function () {{
        // {code:02X} - RL {reg.upper()}
        // 2  8
        // Z 0 0 C
        const r = (this.{reg} << 1) | this.flagC;
        this.flagC = r & 0x100;
        this.{reg} = r;
        this.flagZ = this.{reg} === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
        }},''')

def rr():
    for i, reg in enumerate('bcdehl a'):
        code = 0x18 + i
        print(f'''\
    function () {{
        // {code:02X} - RR {reg.upper()}
        // 2  8
        // Z 0 0 C
        const d0 = this.{reg} & 0x01;
        this.{reg} = (this.{reg} >> 1) | (this.flagC << 7);
        this.flagZ = this.{reg} === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = d0;
        this.pc += 2;
        this.clock += 8;
        }},''')

def sla():
    for i, reg in enumerate('bcdehl a'):
        code = 0x20 + i
        print(f'''\
    function () {{
        // {code:02X} - SLA {reg.upper()}
        // 2  8
        // Z 0 0 C
        this.flagC = this.{reg} & 0x80;
        this.{reg} = this.{reg} << 1;
        this.flagZ = this.{reg} === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
        }},''')

def sra():
    for i, reg in enumerate('bcdehl a'):
        code = 0x28 + i
        print(f'''\
    function () {{
        // {code:02X} - SRA {reg.upper()}
        // 2  8
        // Z 0 0 C
        this.flagC = this.{reg} & 0x01;
        this.{reg} = (this.{reg} >> 1) | (this.{reg} & 0x80);
        this.flagZ = this.{reg} === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
        }},''')

def swap():
    for i, reg in enumerate('bcdehl a'):
        code = 0x30 + i
        print(f'''\
    function () {{
        // {code:02X} - SWAP {reg.upper()}
        // 2  8
        // Z 0 0 0
        this.{reg} = (this.{reg} << 4) | (this.{reg} >> 4);
        this.flagZ = this.{reg} === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.flagC = 0;
        this.pc += 2;
        this.clock += 8;
        }},''')

def srl():
    for i, reg in enumerate('bcdehl a'):
        code = 0x38 + i
        print(f'''\
    function () {{
        // {code:02X} - SRL {reg.upper()}
        // 2  8
        // Z 0 0 C
        this.flagC = this.{reg} & 0x01;
        this.{reg} = this.{reg} >> 1;
        this.flagZ = this.{reg} === 0;
        this.flagN = 0;
        this.flagH = 0;
        this.pc += 2;
        this.clock += 8;
        }},''')

def bit():
    code = 0x40
    for b in range(8):
        for reg in 'bcdehl a':
            if reg == ' ':
                reg = 'mmu_get(this.hl)'
                reg_name = '(HL)'
                delta_time = 16
            else:
                reg_name = reg.upper()
                delta_time = 8
            print(f'''\
    function () {{
        // {code:02X} - BIT {b},{reg_name}
        // 2  {delta_time}
        // Z 0 1 -
        this.flagZ = !(this.{reg} & 0x{2**b:02x});
        this.flagN = 0;
        this.flagH = 1;
        this.pc += 2;
        this.clock += {delta_time};
        }},''')
            code += 1

def res():
    code = 0x80
    for b in range(8):
        mask = f'0x{255 - (2**b):02x}'
        for reg in 'bcdehl a':
            if reg == ' ':
                reg_name = '(HL)'
                affect_line = f'this.mmu_set(this.hl, this.mmu_get(this.hl) & {mask});'
                delta_time = 16
            else:
                reg_name = reg.upper()
                affect_line = f'this.{reg} &= {mask};'
                delta_time = 8
            print(f'''\
    function () {{
        // {code:02X} - RES {b},{reg_name}
        // 2  {delta_time}
        // - - - -
        {affect_line}
        this.pc += 2;
        this.clock += {delta_time};
        }},''')
            code += 1

def set():
    code = 0xC0
    for b in range(8):
        mask = f'0x{(2**b):02x}'
        for reg in 'bcdehl a':
            if reg == ' ':
                reg_name = '(HL)'
                affect_line = f'this.mmu_set(this.hl, this.mmu_get(this.hl) | {mask});'
                delta_time = 16
            else:
                reg_name = reg.upper()
                affect_line = f'this.{reg} |= {mask};'
                delta_time = 8
            print(f'''\
    function () {{
        // {code:02X} - SET {b},{reg_name}
        // 2  {delta_time}
        // - - - -
        {affect_line}
        this.pc += 2;
        this.clock += {delta_time};
        }},''')
            code += 1

def printOp():
    with open("opcodes.txt") as f_in:
        with open("printOp.js", "w") as f_out:
            f_out.write('''\
function hex(n, length=4) {
    return "0x" + ("0000" + n.toString(16)).substr(-4);
}

assemblyCode = [
''')
            for _ in range(256):
                line1 = f_in.readline().strip()
                line2 = f_in.readline().strip()
                line3 = f_in.readline().strip()
                if line1 != '':
                    argc = int(line2[0]) - 1
                    if argc == 1:
                        params = ", ${hex(this.mmu_get(this.pc + 1), 2)}"
                    elif argc == 2:
                        params = ", ${hex(this.mmu_get16(this.pc + 1), 4)}"
                    else:
                        params = ""
                    f_out.write(f'''\
        function () {{
            return `${{hex(this.pc)}} - {line1}{params}`;
        }},
''')
                else:
                    f_out.write(f'''\
        function () {{
            return `${{hex(this.pc)}} - Invalid OpCode ! (${{hex(this.mmu_get16(this.pc), 2)}})`;
        }},
''')
            f_out.write('];\n')


def makeDescriptions():
    with open("asm_code.js", "w") as f_out:
        with open("opcodes.txt") as f_in:
            f_out.write('asmCode = [')
            for _ in range(256):
                line1 = f_in.readline().strip()
                line2 = f_in.readline().strip()
                line3 = f_in.readline().strip()
                f_out.write(f'["{line1}", "{line2}", "{line3}"],')
            f_out.write('];\n')
        with open("cbopcodes.txt") as f_in:
            f_out.write('asmCodeCB = [')
            for _ in range(256):
                line1 = f_in.readline().strip()
                line2 = f_in.readline().strip()
                line3 = f_in.readline().strip()
                f_out.write(f'["{line1}", "{line2}", "{line3}"],')
            f_out.write('];\n')


makeDescriptions()
