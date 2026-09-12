import { test, expect, Page } from '@playwright/test';

async function performLogin(page: Page)
{
    await page.goto('http://localhost:4200/login');
    await page.locator('#key').fill('test@man.com');
    await page.locator('#password').fill('LePassword1');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('http://localhost:4200/');
}

async function giveUpFirstAvailablePost(page: Page)
{
    const firstPost = page.locator('app-post-card').first();
    await firstPost.waitFor({ state: 'visible', timeout: 10000 });
    
    const giveUpBtn = firstPost.locator('.btn-giveup');
    if (await giveUpBtn.isVisible())
    {
        await giveUpBtn.click();
        const confirmModalBtn = page.locator('app-confirm-modal .btn-confirm');
        await confirmModalBtn.waitFor({ state: 'visible', timeout: 5000 });
        await confirmModalBtn.click();
        await page.waitForTimeout(500); 
    }
}

test('1. User can register a new account', async ({ page }) =>
{
    const uniqueId = Date.now();
    await page.goto('http://localhost:4200/register');
    await page.locator('#username').fill(`user_${uniqueId}`);
    await page.locator('#email').fill(`user_${uniqueId}@test.com`);
    await page.locator('#password').fill('LePassword1');
    await page.locator('#confirmPassword').fill('LePassword1');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('http://localhost:4200/');
});

test('2. Global feed loads and displays sketches', async ({ page }) =>
{
    await page.goto('http://localhost:4200/');
    const postCards = page.locator('app-post-card');
    await expect(postCards.first()).toBeVisible({ timeout: 10000 });
});

test('3. Leaderboard displays entries and allows tab switching', async ({ page }) =>
{
    await page.goto('http://localhost:4200/leaderboard');
    await expect(page.locator('h2')).toHaveText('Leaderboard');
    
    await page.getByRole('button', { name: 'Top Artists' }).click();
    await expect(page.getByRole('button', { name: 'Top Artists' })).toHaveClass(/active/);
});

test('4. User can select a word and initialize canvas drawing', async ({ page }) =>
{
    await performLogin(page);

    await page.goto('http://localhost:4200/sketcher');
    
    const wordBtn = page.locator('.btn-word').first();
    await wordBtn.waitFor({ state: 'visible' });
    await wordBtn.click();

    await expect(page.locator('canvas')).toBeVisible();
});

test('5. User can navigate to following feed', async ({ page }) =>
{
    await performLogin(page);

    await page.getByRole('link', { name: 'Following' }).click();
    await expect(page).toHaveURL(/.*following/);
});

test('6. User can view profile page with stats', async ({ page }) =>
{
    await performLogin(page);

    const userId = await page.evaluate(() => localStorage.getItem('userId'));
    const username = await page.evaluate(() => localStorage.getItem('username'));

    await page.goto(`http://localhost:4200/profile/${userId}-${username}`);
    await expect(page.locator('.profile-header')).toBeVisible();
});

test('7. User can submit a wrong guess and see feedback', async ({ page }) =>
{
    await performLogin(page);

    await page.locator('app-post-card').first().waitFor({ state: 'visible', timeout: 10000 });
    
    const guessInput = page.locator('input[placeholder="Guess here"]').first();
    await guessInput.waitFor({ state: 'visible', timeout: 5000 });
    await guessInput.fill('parolasbagliata123');
    await page.getByRole('button', { name: 'Guess' }).first().click();
    await expect(page.locator('.inline-feedback-toast')).toBeVisible();
});

test('8. User can toggle follow status on a profile', async ({ page }) =>
{
    await performLogin(page);

    await page.locator('app-post-card').first().waitFor({ state: 'visible', timeout: 10000 });
    
    await page.locator('.author-name').first().click();
    await expect(page.locator('.profile-header')).toBeVisible();

    const followBtn = page.locator('.btn-follow');
    if (await followBtn.isVisible())
    {
        await followBtn.click();
        await expect(followBtn).toHaveClass(/following/);
    }
});

test('9. User can give up and give an upvote to a sketch', async ({ page }) =>
{
    await performLogin(page);
    await giveUpFirstAvailablePost(page);

    const likeBtn = page.locator('.action-btn').filter({ has: page.locator('.bxs-upvote') }).first();
    await likeBtn.waitFor({ state: 'visible', timeout: 5000 });
    await likeBtn.click();
    await expect(likeBtn).toHaveClass(/active-like/);
});

test('10. User can give up and write a comment', async ({ page }) =>
{
    await performLogin(page);
    await giveUpFirstAvailablePost(page);

    const commentBtn = page.locator('.action-btn').filter({ has: page.locator('.bx-message-rounded') }).first()

    await commentBtn.scrollIntoViewIfNeeded();
    await commentBtn.click();
    
    const commentInput = page.locator('input[placeholder="Add a comment..."]');
    await commentInput.waitFor({ state: 'visible', timeout: 5000 });
    await commentInput.fill('Test comment automated');
    await page.locator('.btn-send').click();
    await expect(page.getByText('Test comment automated')).toBeVisible();
});