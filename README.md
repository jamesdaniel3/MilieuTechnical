## Milieu Technical Project

![Screenshot of home page](./home.png)

A video demonstration of the project running can be found [here](./demo.mov).

If you want to test it out, you can clone it and run the following:

```bash
cd freezer-frontend

npm install

npm run dev
```

### UX Decisions & Accessibility

**Visual Design & Branding:**

- **Consistent Styling**: All form inputs, buttons, and interactive elements follow the same design language with consistent border radius, padding, and hover states
- **Status Indicators**: Color-coded freshness badges (green for fresh, yellow for expiring soon, red for expired) provide immediate visual feedback
- **React-toastify**: decided to use the `react-toastify` library to implement toasts rather than writing my own. I chose to do this because it can allow for easy creation and styling of toasts and does not add much weight to the codebase. With how prevelant toasts are in large projects, I think it is reasonable to import a package to do them well.

**User Experience:**

- **Form Validation**: Rather than allowing users to submit bad data and giving them feedback, the form simply does not allow submission until it's data is valid. This is indicated by the grayed out button. It leaves the developer with less text to format and clearly indicates to the user whether or not they can submit.
- **Data Restrictions**: Character limits were added to certain form fields to prevent users from submitting massive amounts of text. Live character counts provide the users with feedback as they type.
- **Site Sectioning**: The split of the site data by section of the freezer is meant to mimic the layout of the freezer, allowing users to use their prexising mental models to more easily navigate the site. When the site shrinks to mobile sizes, these sections are simply stacked.

**Accessibility Features:**

- **High Contrast Mode**: CSS variables and media queries support system high contrast preferences
- **Focus Indicators**: High-contrast focus outlines were used where applicable
- **Semantic HTML**: Proper use of form elements, labels, and semantic structure
- **Skip Links**: Hidden navigation links for keyboard users to jump to main content

### Performance Decisions

**React Performance Optimizations:**

- **Memoization**: Extensive use of `useMemo` and `useCallback` to prevent unnecessary re-renders:
  - Filtered items list is memoized based on all filter dependencies
  - Item status calculations are memoized per item
  - Form validation errors are memoized based on form state
  - Hook return values are memoized to prevent child re-renders
- **Component Memoization**: `ItemCard` component wrapped in `React.memo` to prevent re-renders when props haven't changed
- **Efficient Filtering**: Multi-stage filtering pipeline that processes items only when necessary dependencies change

**Simulated Failure Design:**

- Simulated failure is only enabled if the user is in development mode, as defined by environment vairables
- Failure is delayed, both so users can see the rollback take effect and to better simulate an environment with a seperate hosted database
- Failure rate is adjustable, but can be guaranteed for the sake of testing
