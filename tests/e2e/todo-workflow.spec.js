const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./page-objects/TodoPage');

test('user can add and complete a task', async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.open();

  await todoPage.addTask('Playwright task');
  await expect(page.getByText('Playwright task').first()).toBeVisible();

  await todoPage.toggleFirstTask();
  await expect(page.getByRole('checkbox').first()).toBeChecked();
});
