# Copilot Instructions for Apartment Scanner

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a full-stack apartment scanner application built with Node.js/TypeScript backend and React/TypeScript frontend. The app automatically scrapes Israeli real estate websites (Yad2, iHomes) for apartments in Ganei Tikva and Kiryat Ono, presenting them in a drag-and-drop Kanban interface.

## Code Style & Architecture

### Backend (Node.js + TypeScript)
- Use TypeScript strict mode
- Follow RESTful API conventions
- Use async/await for asynchronous operations
- Implement proper error handling with try/catch
- Use MongoDB with Mongoose for data persistence
- Structure code in services, models, routes, scrapers folders
- Use environment variables for configuration
- Implement proper logging with console.log for development

### Frontend (React + TypeScript)
- Use functional components with hooks
- Implement TypeScript interfaces for all props and data
- Use Tailwind CSS for styling with semantic class names
- Follow React best practices (proper key props, event handling)
- Use @dnd-kit for drag-and-drop functionality
- Implement proper error boundaries and loading states
- Use axios for API calls with proper error handling

### Scraping Guidelines
- Use Puppeteer for dynamic content scraping
- Implement delays between requests to be respectful
- Handle errors gracefully and continue processing
- Use proper CSS selectors that are likely to be stable
- Implement deduplication logic
- Add user-agent headers to appear more human-like

### Database Schema
- Use the shared Listing interface consistently
- Implement proper indexes for performance
- Use ObjectId for unique identifiers
- Store dates as proper Date objects
- Implement soft deletes where appropriate

### API Design
- Use proper HTTP status codes
- Return consistent response format: { success, data, error }
- Implement request validation
- Use RESTful endpoint naming
- Add proper CORS configuration

### Security & Ethics
- Never scrape websites that explicitly forbid it in robots.txt
- Implement rate limiting and respectful scraping practices
- Use environment variables for sensitive data
- Validate all user inputs
- Implement proper error messages without exposing internals

### Israeli Context
- Format prices in Israeli Shekels (₪)
- Use Hebrew text where appropriate (e.g., "חדרים" for rooms)
- Handle right-to-left text properly
- Use Israeli date/time formats
- Target Israeli real estate websites (Yad2, iHomes)

## Common Patterns

### Error Handling
```typescript
try {
  const result = await someAsyncOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: 'User-friendly message' };
}
```

### React Components
```typescript
interface ComponentProps {
  // Define all props with types
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // Use hooks at the top
  // Implement component logic
  // Return JSX with proper accessibility
}
```

### API Calls
```typescript
const response = await api.get<ApiResponse<DataType>>('/endpoint');
if (response.data.success) {
  return response.data.data;
} else {
  throw new Error(response.data.error);
}
```

## File Organization

- Keep components small and focused
- Extract custom hooks for reusable logic
- Use barrel exports (index.ts) for clean imports
- Separate concerns (UI, business logic, data access)
- Use consistent naming conventions (camelCase, PascalCase for components)
- Group related files in folders (components, services, types)

## Testing Considerations

- Write tests for critical business logic
- Mock external dependencies (database, web scraping)
- Test error scenarios and edge cases
- Use proper TypeScript types in tests
- Test API endpoints with different inputs

## Performance

- Implement pagination for large datasets
- Use React.memo for expensive components
- Optimize database queries with proper indexes
- Implement caching where appropriate
- Use background jobs for heavy operations (scraping)

When writing code for this project, prioritize code readability, type safety, and following the established patterns. Always consider the Israeli apartment hunting context and implement features that would be genuinely useful for users searching for apartments in the specified areas.
