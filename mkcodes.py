import re

def parseCode(file):
    line1 = file.readline().strip()
    line2 = file.readline().strip()
    line3 = file.readline().strip()

    result = {
        'line1': line1,
        'line2': line2,
        'line3': line3,
    }

    if line1 == '':
        result['cmd'] = 'ERR'
        return result

    line1 = line1.split(' ', 1)
    result['cmd'] = line1[0]
    if len(line1) > 1:
        result['args'] = line1[1].split(',')
    result['pc'], result['clock'] = line2.split('  ')
    result['flags'] = line3.split(' ')
    return result


def ld(data):
    incr_hl = 0
    lines = []

    dest, src = data['args']

    if src == 'd16':
        source = 'this.mmu_get_d16()'
    elif src == 'd8':
        source = 'this.mmu_get_d8()'
    elif src == '(a8)':
        source = 'this.mmu_get(0xFF00 | this.mmu_get_d8())'
    elif src == '(a16)':
        source = 'this.mmu_get(this.mmu_get_d16())'
    elif src == 'SP':
        source = 'this._sp'
    elif src == 'SP+r8':
        source = 'this.mmu_get((this._sp + int8(this.mmu_get_d8()) & 0xFFFF)'
    elif src.startswith('(HL'):
        source = f'this.mmu_get(this.cpu_getHL())'
        if src[3] == '+':
            incr_hl = 1
        elif src[3] == '-':
            incr_hl = -1
    elif src.startswith('('):
        if len(src) == 3:
            source = f'this.mmu_get(0xFF00 | this._{src[1].lower()})'
        elif len(src) == 4:
            source = f'this.mmu_get(this.cpu_get{src[1:3]}())'
    else:
        source = f'this.cpu_get{src}()'

    if dest == '(a8)':
        lines.append(f'this.mmu_set(0xFF00 | this.mmu_get_d8(), {source});')
    elif dest == '(a16)':
        lines.append(f'this.mmu_set(this.mmu_get_d8() | (this.mmu_get_d8() << 8), {source});')
    elif dest.startswith('(HL'):
        lines.append(f'this.mmu_set(this.cpu_getHL(), {source});')
        if dest[3] == '+':
            incr_hl = 1
        elif dest[3] == '-':
            incr_hl = -1
    elif dest.startswith('('):
        if len(dest) == 3:
            lines.append(f'this.mmu_set(0xFF00 | this._{dest[1].lower()}, {source});')
        elif len(dest) == 4:
            lines.append(f'this.mmu_set(this.cpu_get{dest[1:3]}(), {source});')
    else:
        lines.append(f'this.cpu_set{dest}({source});')

    if incr_hl == 1:
        lines.append('this.cpu_setHL(this.cpu_getHL() + 1);')
    elif incr_hl == -1:
        lines.append('this.cpu_setHL(this.cpu_getHL() - 1);')

    return lines


def inc(data):
    lines = []
    dest, = data['args']
    if len(dest) == 2:
        lines.append(f'this.cpu_set{dest}(this.cpu_get{dest} + 1);')
    else:
        if dest == '(HL)':
            lines.append('const addr = this.cpu_getHL();')
            lines.append('const v = this.mmu_get(addr);')
            lines.append('this.mmu_set(addr, v + 1);')
        else:
            lines.append(f'const v = this.cpu_get{dest};')
            lines.append(f'this.cpu_set{dest}(v + 1);')
        lines.append('if (v & 0xF === 0xF) this.cpu_setFlagH();')
        lines.append('if (v === 0xFF) this.cpu_setFlagZ();')
    return lines


def dec(data):
    lines = []
    dest, = data['args']
    if len(dest) == 2:
        lines.append(f'this.cpu_set{dest}(this.cpu_get{dest} - 1);')
    else:
        if dest == '(HL)':
            lines.append('const addr = this.cpu_getHL();')
            lines.append('const v = this.mmu_get(addr);')
            lines.append('this.mmu_set(addr, v - 1);')
        else:
            lines.append(f'const v = this.cpu_get{dest};')
            lines.append(f'this.cpu_set{dest}(v - 1);')
        lines.append('if (v & 0xF === 0) this.cpu_setFlagH();')
        lines.append('if (v === 0x01) this.cpu_setFlagZ();')
    return lines


def make_instructions():
    file = open("opcodes.txt")
    datas = [parseCode(file) for _ in range(256)]
    output = []
    for data in datas:
        print(data["line1"], data["line2"], data["line3"])
        lines = [
            f'// {data["line1"]}',
            f'// {data["line2"]}',
            f'// {data["line3"]}']
        if data['cmd'].startswith('LD'):
            lines += ld(data)
        if "clock" in data:
            lines.append(f'this.clock += {data["clock"]};')
        output.append('\n'.join(lines))
    return output


opcodes = make_instructions()

for c in opcodes:
    if c.startswith('// LD'):
        print(c)
        print()

