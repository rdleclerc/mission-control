// Debug test for Mission Control drag-and-drop
import { test, expect } from '@playwright/test';

test('debug drag and drop', async ({ page }) => {
  // Go to Mission Control
  await page.goto('https://mission-control-five-sandy.vercel.app');
  
  // Wait for tasks to load
  await page.waitForSelector('.kanban-card');
  
  // Get the first task card
  const card = page.locator('.kanban-card').first();
  
  // Check if it's draggable
  const isDraggable = await card.getAttribute('draggable');
  console.log('Is draggable:', isDraggable);
  
  // Try to trigger drag events manually
  await card.evaluate((node) => {
    const event = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
      dataTransfer: new DataTransfer()
    });
    node.dispatchEvent(event);
    console.log('Drag event dispatched');
  });
  
  // Wait a bit
  await page.waitForTimeout(500);
  
  // Check if task is still there
  const count = await page.locator('.kanban-card').count();
  console.log('Task count:', count);
});
