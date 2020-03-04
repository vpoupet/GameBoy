import re


def c(x):
    return {
        'A': 'this.registers[0]',
        'F': 'this.registers[1]',
        'B': 'this.registers[2]',
        'C': 'this.registers[3]',
        'D': 'this.registers[4]',
        'E': 'this.registers[5]',
        'H': 'this.registers[6]',
        'L': 'this.registers[7]',
        'AF': 'this.registers16[0]',
        'BC': 'this.registers16[1]',
        'DE': 'this.registers16[2]',
        'HL': 'this.registers16[3]',
        'HL+': 'this.registers16[3]++',
        'HL-': 'this.registers16[3]--',
        'SP': 'this.registers16[4]',
        'PC': 'this.registers16[5]',
        'd8': f'this.mmu_get(this.registers16[5]++)',
        'a8': f'this.mmu_get(this.registers16[5]++)',
        'd16': f'this.mmu_get(this.registers16[5]++) | (this.mmu_get(this.registers16[5]++) << 8)',
        'a16': f'this.mmu_get(this.registers16[5]++) | (this.mmu_get(this.registers16[5]++) << 8)',
        'SET_Z': 'this.registers[1] |= 0b10000000',
        'RESET_Z': 'this.registers[1] &= 0b01111111',
        'SET_N': 'this.registers[1] |= 0b01000000',
        'RESET_N': 'this.registers[1] &= 0b10111111',
        'SET_H': 'this.registers[1] |= 0b00100000',
        'RESET_H': 'this.registers[1] &= 0b11011111',
        'SET_C': 'this.registers[1] |= 0b00010000',
        'RESET_C': 'this.registers[1] &= 0b11101111',
        'GET_C': '(this.registers[1] & 0b00100000) << 5',
        'r8': '(const x = this.mmu_get_d8(), x & 0x80 ? x - 0x100 : x)',
    }[x]


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
    lines = []
    dest, src = data['args']

    if src == 'SP+r8':
        lines.append(f'const sp = {c("SP")};')
        lines.append(f'const r8 = {c("r8")};')
        lines.append(f'{c("RESET_Z")};')
        lines.append(f'{c("RESET_N")};')
        lines.append(f'(sp & 0x0F + r8 & 0x0F) & 0xF0 ? {c("SET_H")} : {c("RESET_H")};')
        lines.append(f'(sp & 0xFF + r8 & 0xFF) & 0x0F00 ? {c("SET_C")} : {c("RESET_C")};')
        source = f'this.mmu_get16((sp + r8) & 0xFFFF)'
    elif src.startswith('('):
        if src == '(a8)' or len(src) == 3:
            source = f'this.mmu_get(0xFF00 | {c(src[1:-1])})'
        else:
            source = f'this.mmu_get({c(src[1:-1])})'
    else:
        source = c(src)

    if dest.startswith('('):
        if dest == '(a8)' or len(dest) == 3:
            lines.append(f'this.mmu_set(0xFF00 | {c(dest[1:-1])}, {source});')
        else:
            lines.append(f'this.mmu_set({c(dest[1:-1])}, {source});')
    else:
        lines.append(f'{c(dest)} = {source};')

    return lines


def inc(data):
    lines = []
    dest, = data['args']
    if len(dest) == 2:
        lines.append(f'{c(dest)}++;')
    else:
        if dest == '(HL)':
            lines.append(f'const v = this.mmu_inc({c("HL")});')
        else:
            lines.append(f'const v = {c(dest)}++;')
        lines.append(f'(v & 0x0F + 1) & 0xF0 ? {c("SET_H")} : {c("RESET_H")};')
        lines.append(f'(v + 1) & 0xF00 ? {c("SET_C")} : {c("RESET_C")};')
    return lines


def dec(data):
    lines = []
    dest, = data['args']
    if len(dest) == 2:
        lines.append(f'{c(dest)}--;')
    else:
        if dest == '(HL)':
            lines.append(f'const v = this.mmu_dec({c("HL")});')
        else:
            lines.append(f'const v = {c(dest)}--;')
        lines.append(f'(v & 0x0F - 1) & 0xF0 ? {c("SET_H")} : {c("RESET_H")};')
        lines.append(f'(v - 1) & 0xF00 ? {c("SET_C")} : {c("RESET_C")};')
    return lines


def add(data):
    lines = []
    cmd = data['cmd']
    a, b = data['args']
    lines.append(f'const a = {c(a)};')
    if b == '(HL)':
        lines.append(f'const b = this.mmu_get({c("HL")});')
    else:
        lines.append(f'const b = {c(b)};')

    if cmd == 'ADC':
        lines.append(f'const c = {c("GET_C")};')
        lines.append(f'{c(a)} += b + c;')
    else:
        lines.append(f'{c(a)} += b;')

    # Z flag
    if a == 'SP':
        lines.append(f'{c("RESET_Z")};')
    elif a == 'A':
        lines.append(f'{c(a)} ? {c("RESET_Z")} : {c("SET_Z")};')
    # N flag
    lines.append(f'{c("RESET_N")};')
    # H and C flags
    if a == 'HL':
        lines.append(f'(a & 0x0FFF + b & 0x0FFF) & 0xF000 ? {c("SET_H")} : {c("RESET_H")};')
        lines.append(f'(a + b) & 0xF0000 ? {c("SET_C")} : {c("RESET_C")};')
    elif a == 'SP':
        lines.append(f'(a & 0x0F + b & 0x0F) & 0xF0 ? {c("SET_H")} : {c("RESET_H")};')
        lines.append(f'(a & 0xFF + b) & 0xF00 ? {c("SET_C")} : {c("RESET_C")};')
    elif cmd == 'ADC':
        lines.append(f'(a & 0x0F + b & 0x0F + 1) & 0x00F0 ? {c("SET_H")} : {c("RESET_H")};')
        lines.append(f'(a + b + 1) & 0xF00 ? {c("SET_C")} : {c("RESET_C")};')
    else:
        lines.append(f'(a & 0x0F + b & 0x0F) & 0x00F0 ? {c("SET_H")} : {c("RESET_H")};')
        lines.append(f'(a + b) & 0xF00 ? {c("SET_C")} : {c("RESET_C")};')
    return lines


def make_instructions():
    file = open("opcodes.txt")
    datas = [parseCode(file) for _ in range(256)]
    output = []
    for data in datas:
        cmd = data['cmd']
        print(data["line1"], data["line2"], data["line3"])
        lines = [
            f'// {data["line1"]}',
            f'// {data["line2"]}',
            f'// {data["line3"]}']
        if cmd in ['LD', 'LDH']:
            lines += ld(data)
        elif cmd == 'INC':
            lines += inc(data)
        elif cmd == 'DEC':
            lines += dec(data)

        if "clock" in data:
            lines.append(f'this.clock += {data["clock"]};')
        output.append('\n'.join(lines))
    return output


opcodes = make_instructions()

for c in opcodes:
    if c.startswith('// LD'):
        print(c)
        print()

