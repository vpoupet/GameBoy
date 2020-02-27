import re

def parseCode(file):
    line1 = file.readline().strip()
    line2 = file.readline().strip()
    line3 = file.readline().strip()
    result = {}
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
    incrHL = 0
    output = []

    dest, src = data['args']
    if len(src) == 1:
        source = f'this.{src.lower()}'
    elif src == 'd16':
        source = 'this.mmu_getPC() | (this.mmu_getPC() << 8)'
    elif src == 'd8':
        source = 'this.mmu_getPC()'
    elif src == '(a8)':
        source = 'this.mmu_get(0xFF00 | this.mmu_getPC())'
    elif src == 'SP+r8':
        source = 'this.mmu_get(this.sp + int8(this.mmu_getPC())'
    elif src.startswith('('):
        if len(src) == 3:
            source = f'this.mmu_get(0xFF00 | this.{src[1].lower()})'
        elif len(src) == 4:
            source = f'this.mmu_get(this.cpu_get{src[1:3]}())'
        elif len(src) == 5:
            source = f'this.mmu_get(this.cpu_get{src[1:3]}())'
            if src[3] == '+':
                incrHL = 1
            else:
                incrHL = -1
    elif len(src) == 2:
        source = f'this.cpu_get{src}()'

    if len(dest) == 1:
        output.append(f'this.{dest.lower()} = {source};')
    elif dest == 'SP':
        output.append(f'this.sp = {source};')
    elif dest == '(a8)':
        output.append(f'this.mmu_set(0xFF00 | this.mmu_getPC(), {source});')
    elif dest.startswith('('):
        if len(src) == 3:
            output.append(f'this.mmu_set(0xFF00 | this.{dest[1].lower()}, {source});')
        elif len(src) == 4:
            output.append(f'this.mmu_set(this.cpu_get{dest[1:3]}, {source});')
    elif len(dest) == 2:
        output.append(f'this.cpu_set{dest}({source});')

    output.append(f'this.clock += {data["clock"]};')
    return '\n'.join(output)

file = open("opcodes.txt")
codeData = [parseCode(file) for _ in range(256)]
