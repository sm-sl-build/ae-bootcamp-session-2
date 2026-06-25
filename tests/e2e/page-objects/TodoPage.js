class TodoPage {
  constructor(page) {
    this.page = page;
  }

  async open() {
    await this.page.goto('/');
  }

  async addTask(title) {
    await this.page.getByPlaceholder('Enter task title').fill(title);
    await this.page.getByRole('button', { name: 'Add Task' }).click();
  }

  async toggleFirstTask() {
    await this.page.getByRole('checkbox').first().check();
  }
}

module.exports = { TodoPage };
