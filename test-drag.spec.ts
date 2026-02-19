// Test script for Mission Control drag-and-drop
import { test, expect } from '@playwright/test';

test('drag and drop tasks between columns', async ({ page }) => {
  // Go to Mission Control
  await page.goto('https://mission-control-five-sandy.vercel.app');
  
  // Wait for tasks to load
  await page.waitForSelector('.kanban-card');
  
  // Get initial counts
  const todoCount = await page.locator('.kanban-column').first().locator('.kanban-card').count();
  const inProgressCount = await page.locator('.kanban-column').nth(1).locator('.kanban-card').count();
  
  console.log(`Initial: Todo=${todoCount}, InProgress=${inProgressCount}`);
  
  // Get first task in In Progress
  const sourceCard = page.locator('.kanban-column').nth(1).locator('.kanban-card').first();
  const targetColumn = page.locator('.kanban-column').first();
  
  // Get bounding boxes
  const sourceBox = await sourceCard.boundingBox();
  const targetBox = await targetColumn.boundingBox();
  
  if (!sourceBox || !targetBox) {
    throw new Error('Could not get bounding boxes');
  }
  
  console.log(`Source: x=${sourceBox.x}, y=${sourceBox.y}`);
  console.log(`Target: x=${targetBox.x}, y=${targetBox.y}`);
  
  // Perform drag using mouse events
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 50, { steps: 10 });
  await page.mouse.up();
  
  // Wait for the update
  await page.waitForTimeout(1500);
  
  // Check if task moved
  const newTodoCount = await page.locator('.kanban-column').first().locator('.kanban-card').count();
  const newInProgressCount = await page.locator('.kanban-column').nth(1).locator('.kanban-card').count();
  
  console.log(`After drag: Todo=${newTodoCount}, InProgress=${newInProgressCount}`);
  
  // Verify the drag worked
  expect(newTodoCount).toBe(todoCount + 1);
  expect(newInProgressCount).toBe(inProgressCount - 1);
});
