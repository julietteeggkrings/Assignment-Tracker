# Assignment Tracker

A comprehensive web application for managing academic coursework, assignments, and deadlines.

## Overview

Assignment Tracker is a student-focused productivity tool that helps you:

- **Track assignments** across multiple courses with due dates, times, and status updates
- **Manage priorities** with a dedicated To-Do list and priority levels (High, Medium, Low)
- **Organize classes** with course codes, titles, instructors, and color-coded organization
- **Visualize deadlines** with an integrated calendar view
- **Import syllabi** using AI-powered document parsing to automatically extract assignments
- **Export data** in multiple formats (CSV, Excel) with styled formatting
- **Stay on top** of overdue and upcoming assignments with automatic status tracking

## Features

### 📚 Masterlist View
- Complete overview of all assignments sorted by urgency
- Color-coded status indicators (Not Started, In Progress, Submitted, Completed, Overdue)
- Quick status updates and editing
- Days-until-due calculations with visual urgency indicators

### ✅ To-Do List
- Dedicated task list for focused work
- Priority management (High/Low)
- Completion tracking separate from main status
- Quick add/remove from masterlist

### 🎓 My Classes
- Course management with custom colors
- Progress tracking per class
- Assignment statistics (total, completed, percentage)
- Edit course details

### 📅 Calendar View
- Visual representation of all deadlines
- Color-coded by class
- Quick reference for planning

### 📄 Import & Export
- **AI-Powered Import**: Upload PDF syllabi and automatically extract assignments
- **Styled Excel Export**: Download beautifully formatted spreadsheets with colors, borders, and styling
- **CSV Export**: Plain text format for maximum compatibility
- **Copy to Clipboard**: Quick data sharing

## Technology Stack

This project is built with modern web technologies:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI component library
- **shadcn/ui** - Beautiful, accessible component system
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend database and authentication
- **ExcelJS** - Styled Excel export generation
- **date-fns** - Date manipulation and formatting

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Setup

The project uses Supabase for backend services. Environment variables are managed automatically, but you can configure them in the `.env` file if needed.

## Usage

1. **Sign Up/Sign In** - Create an account to save your data
2. **Add Classes** - Set up your courses with codes, titles, and instructors
3. **Import Syllabus** - Upload a PDF syllabus to auto-extract assignments
4. **Add Assignments** - Manually add assignments or let the AI extract them
5. **Track Progress** - Update statuses as you work through assignments
6. **Use To-Do List** - Add urgent tasks to your focused to-do list
7. **Export Data** - Download your assignments in Excel or CSV format

## Project Structure

```
src/
├── components/        # React components
├── contexts/          # React context providers
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── pages/             # Page components
├── types/             # TypeScript type definitions
└── integrations/      # Third-party integrations
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Making Changes

Edit files in the `src/` directory. The dev server will automatically reload when you save changes.

## Deployment

This project can be deployed to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Or any other static hosting provider

Build the project first:
```sh
npm run build
```

Then deploy the contents of the `dist/` directory.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue in the GitHub repository.
