# ASEPS Asia - Project Management Dashboard

## 🚀 Overview
ASEPS Asia is a comprehensive project management and supplier relationship platform designed to streamline construction project workflows, supplier management, and project analytics. Built with modern web technologies, it provides an intuitive interface for managing projects, suppliers, and purchase orders in the construction industry.

## ✨ Features

- **Project Management**: Track and manage construction projects with detailed views
- **Supplier Portal**: Maintain supplier information and track relationships
- **Purchase Orders**: Create and manage purchase orders with ease
- **Analytics Dashboard**: Visualize project metrics and KPIs
- **Client Management**: Keep track of client information and project history
- **Document Management**: Store and manage project-related documents
- **Timeline View**: Visualize project timelines and milestones

## 🛠️ Tech Stack

- **Frontend**: 
  - React 18 with TypeScript
  - Vite for fast development and building
  - Shadcn UI components
  - Radix UI primitives
  - Tailwind CSS for styling
  - Framer Motion for animations

- **State Management & Data Fetching**:
  - React Query for server state management
  - React Hook Form for form handling
  - Zod for schema validation

- **Backend & Storage**:
  - Supabase for authentication and database
  - RESTful API integration

- **Development Tools**:
  - ESLint for code linting
  - Prettier for code formatting
  - TypeScript for type safety

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account (for backend services)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aseps-asia.git
   cd aseps-asia
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Project Structure

```
src/
├── app/                 # App configuration and routing
├── components/          # Reusable UI components
├── contexts/            # React contexts for state management
├── data/                # Static data and configurations
├── hooks/               # Custom React hooks
├── integrations/        # Third-party integrations
├── lib/                 # Utility functions and helpers
├── pages/               # Page components
│   ├── admin/           # Admin-specific pages
│   ├── feedback/        # Feedback-related pages
│   └── purchase-orders/ # Purchase order management
├── services/            # API services and data fetching
└── styles/              # Global styles and themes
```

## 🧪 Testing

Run the test suite:
```bash
npm test
# or
yarn test
```

## 🧹 Linting

Check for linting errors:
```bash
npm run lint
# or
yarn lint
```

## 🏭 Building for Production

Create a production build:
```bash
npm run build
# or
yarn build
```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) for the amazing build tool
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful components
- [Supabase](https://supabase.com/) for the backend services
- All the amazing open-source libraries that made this project possible
