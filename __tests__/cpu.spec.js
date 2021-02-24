import { filterByTerm } from "../src/filterByTerm";
import { DMG } from "../src/dmg.js";

describe("LD operations", () => {
    const dmg = new DMG();
    expect(12).toEqual(12);
})

describe("Filter function", () => {
    test("it should filter by a search term (link)", () => {
        const input = [
            { id: 1, url: "https://www.url1.dev" },
            { id: 2, url: "https://www.url2.dev" },
            { id: 3, url: "https://www.link3.dev" }
        ];

        const output = [{ id: 3, url: "https://www.link3.dev" }];
        expect(filterByTerm(input, "link")).toEqual(output);

        expect(filterByTerm(input, "LINK")).toEqual(output);

        expect(() => filterByTerm(input)).toThrowError();

        expect(() => filterByTerm([], "link")).toThrowError();
    })
})