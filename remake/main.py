import json
import math

import numpy as np
from PIL import Image

reference_colors = (
    (155, 188, 15),
    (139, 172, 15),
    (48, 98, 48),
    (15, 56, 15),
)
TILE_SIZE = 16


class Tile:
    def __init__(self, image):
        if isinstance(image, str):
            image = np.array(Image.open(image))
        self.array = image

    def __eq__(self, other):
        return np.array_equal(self.array, other.array)

    def is_empty(self):
        return not np.any(self.array)

    def string_id(self):
        def color_index(color):
            for i, c in enumerate(reference_colors):
                if (color == c).all():
                    return i

        normal_tile = self.array[::2, ::2]
        indexed_tile = np.apply_along_axis(color_index, 2, normal_tile)
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


class Tileset:
    def __init__(self, image=None):
        self.tiles = []
        if image is not None:
            if isinstance(image, str):
                image = np.array(Image.open(image))
            for i in range(0, image.shape[0], TILE_SIZE):
                for j in range(0, image.shape[1], TILE_SIZE):
                    tile = Tile(image[i:i + TILE_SIZE, j:j + TILE_SIZE])
                    if not tile.is_empty():
                        self.tiles.append(tile)

    def __getitem__(self, item):
        return self.tiles[item]

    def __setitem__(self, key, value):
        self.tiles[key] = value

    def __len__(self):
        return len(self.tiles)

    def index(self, tile):
        for i, t in enumerate(self.tiles):
            if t == tile:
                return i
        return None

    def save_as(self, filename=None):
        nb_lines = math.ceil(len(self.tiles) / 16)
        array = np.zeros((nb_lines * TILE_SIZE, 16 * TILE_SIZE, 4), dtype='uint8')
        for n, tile in enumerate(self.tiles):
            i = n // 16
            j = n % 16
            array[i * TILE_SIZE:(i + 1) * TILE_SIZE, j * TILE_SIZE:(j + 1) * TILE_SIZE, :] = tile.array
        im = Image.fromarray(array)
        if filename is not None:
            im.save(filename)
        return im


def make_tilemap(remake_tiles_img, reference_tiles_img, tileset=None):
    if tileset is None:
        tileset = Tileset()

    if isinstance(remake_tiles_img, str):
        remake_tiles_img = np.array(Image.open(remake_tiles_img))
    if isinstance(reference_tiles_img, str):
        reference_tiles_img = np.array(Image.open(reference_tiles_img))

    tilemap = {}
    tile_offset = 0x8000
    for i in range(0, remake_tiles_img.shape[0], TILE_SIZE):
        for j in range(0, remake_tiles_img.shape[1], TILE_SIZE):
            remake_tile = Tile(remake_tiles_img[i:i + TILE_SIZE, j:j + TILE_SIZE])
            if not remake_tile.is_empty():
                reference_tile = Tile(reference_tiles_img[i:i + TILE_SIZE, j:j + TILE_SIZE])
                tile_index = tileset.index(remake_tile)
                if tile_index is None:
                    tile_index = len(tileset)
                    tileset.tiles.append(remake_tile)
                offset_str = str(tile_offset)
                if offset_str not in tilemap:
                    tilemap[offset_str] = {}
                tilemap[offset_str][reference_tile.string_id()] = tile_index
            tile_offset += 16
    return tilemap, tileset


def append_tilemap(data, tilemap):
    data['tilemaps'].append(tilemap)


if __name__ == '__main__':
    tilemap, tileset = make_tilemap("SUPER MARIOLAND/tiles/tiles01.png", "SUPER MARIOLAND/tiles/tiles01-ref.png")
    with open('SUPER MARIOLAND/data.json') as data_file:
        data = json.load(data_file)

    tileset.save_as('SUPER MARIOLAND/tiles.png')
    data['tilemaps'].append(tilemap)
    with open('SUPER MARIOLAND/data.json', 'w') as data_file:
        json.dump(data, data_file, indent=2)

