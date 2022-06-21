import { test, expect, Page } from "@playwright/test";

let songName: string;
let songId: number;
let songArtist: string;

test.describe("Solve the Heardle", () => {
  test("Get the song and solve the puzzle", async ({ page }) => {
    //Creates a way to intercept network traffic and save the api response
    await page.route("https://api.heardle.app/api/a?id=**", async (route) => {
      const response = await page.request.fetch(route.request());
      let body = await response.json();
      songName = body[0].title;
      songId = body[0].id;
      songArtist = body[0].artist;

      route.continue();
    });

    await page.goto("https://www.heardle.app/");
    await page.locator('button:has-text("Play")').click();
    await page.locator("text=0:00 0:16 >> button").click();
    await page
      .locator('[placeholder="Know it\\? Search for the artist \\/ title"]')
      .click();
    await page
      .locator('[placeholder="Know it\\? Search for the artist \\/ title"]')
      .fill(songArtist + " - " + songName);
    await page
      .locator('[placeholder="Know it\\? Search for the artist \\/ title"]')
      .press("Enter");
    await page
      .locator(`mark:has-text("${songArtist + " - " + songName}")`)
      .click();
    await page.locator("text=Submit").click();

    //asserting that the Heardle was actually solved.
    await expect(page.locator(".w-4").first()).toHaveClass(
      /bg-custom-positive/
    );
    await expect(page.locator(".w-4").last()).not.toHaveClass(
      /bg-custom-positive/
    );
    await expect(page.locator("text=A virtuoso performance!")).toBeVisible;
    await expect(page.locator("text=You got today's Heardle within 1 second."))
      .toBeVisible;
    console.log(
      `If this test passed, I've successfully solved today's Heardle\nSong ID: ${songId}\nSong Name: ${songName}\nSong Artist: ${songArtist}`
    );
  });
});
