# PlayGround Component Refactoring

## Overview
The original `PlayGround.tsx` component was a large, monolithic component (1873 lines) that handled multiple responsibilities. This refactoring breaks it down into smaller, more manageable components and hooks.

## File Structure

### Core Files
- `PlayGround.tsx` - Original monolithic component
- `PlayGroundRefactored.tsx` - New refactored main component
- `types.ts` - All TypeScript interfaces and constants
- `utils.ts` - Utility functions
- `hooks/usePlayground.ts` - Custom hook containing all business logic

### Component Breakdown

#### 1. **MobileHeader** (`components/MobileHeader.tsx`)
- Handles mobile navigation header
- Toggle buttons for system and settings drawers
- Responsive design considerations

#### 2. **SystemPanel** (`components/SystemPanel.tsx`)
- Project selection dropdown
- System prompt editor with character limit
- Save/Clear/Edit functionality for system prompts

#### 3. **SettingsDrawer** (`components/SettingsDrawer.tsx`)
- Model selection dropdown
- RAG (Retrieval-Augmented Generation) settings
- File upload and text input for RAG context
- Chunk size and k-nearest neighbors configuration

#### 4. **ChatInterface** (`components/ChatInterface.tsx`)
- Displays conversation messages
- User and assistant message rendering
- Thinking animation during processing
- Copy and rerun functionality for messages

#### 5. **UserInput** (`components/UserInput.tsx`)
- Text input for user messages
- Send button with loading states
- Clear input functionality
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

#### 6. **BalancePanel** (`components/BalancePanel.tsx`)
- Displays inference token balance
- Buy more tokens functionality
- Loading states and error handling

#### 7. **ClearConfirmationModal** (`components/ClearConfirmationModal.tsx`)
- Confirmation dialog for clearing system prompts
- Warning message and action buttons

#### 8. **Supporting Components**
- `Drawer.tsx` - Reusable drawer component
- `MessageItem.tsx` - Individual message display
- `SettingsPanel.tsx` - Settings configuration panel
- `RAGPanel.tsx` - RAG-specific settings
- `SystemPromptEditor.tsx` - System prompt editing interface

## Key Benefits of Refactoring

### 1. **Maintainability**
- Each component has a single responsibility
- Easier to locate and fix bugs
- Simpler to add new features

### 2. **Reusability**
- Components can be reused in other parts of the application
- Consistent UI patterns across the app

### 3. **Testing**
- Smaller components are easier to unit test
- Business logic is separated in custom hooks

### 4. **Performance**
- Better code splitting opportunities
- Reduced re-renders through proper component isolation

### 5. **Developer Experience**
- Easier to understand and work with
- Better code organization
- Clearer separation of concerns

## State Management

The `usePlayground` hook centralizes all state management and business logic:

- **Chat State**: Messages, user input, processing states
- **UI State**: Drawer states, modals, editing modes
- **Configuration**: Model selection, RAG settings, system prompts
- **Authentication**: Wallet connection, balance management

## Usage

```tsx
import PlayGroundRefactored from './components/playground/PlayGroundRefactored';

// Use the refactored component
<PlayGroundRefactored />
```

## Migration Notes

- The refactored component maintains the same API and functionality
- All existing features are preserved
- The component structure is now more modular and maintainable
- Business logic is centralized in the custom hook

## Future Improvements

1. **Context API**: Consider using React Context for deeply nested state
2. **State Management**: Could integrate with Redux/Zustand for complex state
3. **Performance**: Implement React.memo and useMemo for expensive operations
4. **Accessibility**: Add ARIA labels and keyboard navigation improvements
5. **Internationalization**: Prepare for multi-language support

