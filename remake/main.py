import numpy as np
from PIL import Image

reference_colors = [
    [155, 188, 15],
    [139, 172, 15],
    [48, 98, 48],
    [15, 56, 15],
]
TILE_SIZE = 16
tiles = []


def index_of(arr, arr_list):
    for i, arr2 in enumerate(arr_list):
        if np.array_equal(arr, arr2):
            return i
    return None


def string_id(tile):
    normal_tile = tile[::2, ::2]
    indexed_tile = np.apply_along_axis(lambda t: index_of(t, reference_colors), 2, normal_tile)
    result = ""
    for line in indexed_tile:
        byte0 = 0
        byte1 = 0
        for c in line:
            byte0 *= 2
            byte0 += c % 2
            byte1 *= 2
            byte1 += c // 2
        result += hex(byte0)[2:].zfill(2)
        result += hex(byte1)[2:].zfill(2)
    return result


def make_tilemap(remake_tiles, reference_tiles):
    tilemap = [[] for _ in range(384)]
    tile_id = 0
    for i in range(0, remake_tiles.shape[0], TILE_SIZE):
        for j in range(0, remake_tiles.shape[1], TILE_SIZE):
            remake_tile = remake_tiles[i:i + TILE_SIZE, j:j + TILE_SIZE]
            if np.any(remake_tile):
                reference_tile = reference_tiles[i:i + TILE_SIZE, j:j + TILE_SIZE]
                tile_index = index_of(remake_tile, tiles)
                if tile_index is None:
                    tile_index = len(tiles)
                    tiles.append(remake_tile)
                tilemap[tile_id].append((string_id(reference_tile), tile_index))
            tile_id += 1
    return tilemap


if __name__ == '__main__':
    remake_tiles = np.array(Image.open("SUPER MARIOLAND/tiles/tiles01.png"))
    reference_tiles = np.array(Image.open("SUPER MARIOLAND/tiles/tiles01-ref.png"))
    tilemap = make_tilemap(remake_tiles, reference_tiles)
    print(tilemap)
