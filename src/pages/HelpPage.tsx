import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  BookOpen,
  Users,
  FileText,
  Calendar,
  Download,
  MessageSquare,
  Globe,
  Search,
  Upload,
  FolderPlus,
  FileBarChart,
  BarChart as ChartBar,
  FolderOpen,
  PlusCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HelpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 group flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Button>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-12 text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <BookOpen className="h-12 w-12 mx-auto text-white mb-4" />
              <h1 className="text-4xl font-bold text-white mb-2">ASEPS-Asia Help Center</h1>
              <p className="text-blue-100 text-lg">
                Everything you need to know about using our platform
              </p>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            {/* What is ASEPS-Asia? */}
            <motion.section variants={fadeIn} transition={{ delay: 0.2 }} className="mb-12">
              <div className="flex items-center mb-6">
                <div className="h-10 w-1 bg-blue-500 rounded-full mr-4"></div>
                <h2 className="text-2xl font-bold text-slate-800">What is ASEPS-Asia?</h2>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <p className="text-slate-700 mb-4">
                  ASEPS-Asia is an internal digital system for managing project execution in
                  manufacturing and fabrication. It centralizes project data, timelines, supplier
                  information, and purchase orders to improve communication, traceability, and
                  efficiency across teams and time zones.
                </p>
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800">Key Features:</h3>
                  <ul className="list-disc pl-5 space-y-2 text-slate-700">
                    <li>Dashboard with key project metrics and status</li>
                    <li>Project tracking with timelines and milestones</li>
                    <li>Supplier directory with performance tracking</li>
                    <li>Purchase order management and history</li>
                    <li>Centralized links and external resources</li>
                    <li>Interactive timeline for real-time progress view</li>
                    <li>Built-in analytics and reporting tools</li>
                  </ul>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  {[
                    {
                      icon: <Users className="h-6 w-6 text-blue-500" />,
                      text: 'Improves visibility across teams and regions',
                    },
                    {
                      icon: <FileText className="h-6 w-6 text-blue-500" />,
                      text: 'Ensures better traceability during execution',
                    },
                    {
                      icon: <Globe className="h-6 w-6 text-blue-500" />,
                      text: 'Empowering digitalization of project manufacturing',
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5 }}
                      className="bg-white p-4 rounded-lg shadow-sm border border-slate-100"
                    >
                      <div className="flex items-center">
                        <div className="bg-blue-50 p-2 rounded-lg mr-4">{item.icon}</div>
                        <p className="text-slate-700">{item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Site Navigation Tips */}
            <motion.section variants={fadeIn} transition={{ delay: 0.3 }} className="mb-12">
              <div className="flex items-center mb-6">
                <div className="h-10 w-1 bg-blue-500 rounded-full mr-4"></div>
                <h2 className="text-2xl font-bold text-slate-800">Site Navigation Tips</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Dashboard',
                    icon: <ChartBar className="h-5 w-5" />,
                    desc: 'Your command center with project overviews, recent activities, and quick actions.',
                  },
                  {
                    title: 'Projects',
                    icon: <FileText className="h-5 w-5" />,
                    desc: 'Access all your projects, create new ones, and track progress in real-time.',
                  },
                  {
                    title: 'Clients',
                    icon: <Users className="h-5 w-5" />,
                    desc: 'Manage client relationships, view client details, and track communications.',
                  },
                  {
                    title: 'Timeline',
                    icon: <Calendar className="h-5 w-5" />,
                    desc: 'Visualize project timelines, deadlines, and milestones at a glance.',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start space-x-4"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{item.title}</h3>
                      <p className="text-slate-600 text-sm mt-1">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Simple Tutorials */}
            <motion.section variants={fadeIn} transition={{ delay: 0.4 }} className="mb-12">
              <div className="flex items-center mb-6">
                <div className="h-10 w-1 bg-blue-500 rounded-full mr-4"></div>
                <h2 className="text-2xl font-bold text-slate-800">Quick Tutorials</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Finding a Specific Project',
                    icon: <Search className="h-5 w-5" />,
                    steps: [
                      'Click on "Projects" in the sidebar',
                      'Use the search bar to enter project name or keywords',
                      'Filter results by status, date, or team members',
                      'Click on the project card to view full details',
                      'Use the star icon to save important projects for quick access',
                    ],
                  },
                  {
                    title: 'Finding Reports & Media Directory',
                    icon: <FolderOpen className="h-5 w-5" />,
                    steps: [
                      'Navigate to the External Links page',
                      'Locate the "Project Reports & Media" section',
                      'Find your project folder by name or ID',
                      'Access reports, photos, and tracking documents',
                      'Use the search function to find specific files',
                    ],
                  },
                  {
                    title: 'Assessing Supplier Performance',
                    icon: <FileBarChart className="h-5 w-5" />,
                    steps: [
                      'Go to Suppliers page and select a supplier',
                      'Review key metrics: delivery times and quality scores',
                      'Check compliance history and audit trails',
                      'View past project performance and ratings',
                      'Compare suppliers using category filters',
                    ],
                  },
                  {
                    title: 'Reviewing Project Timeline',
                    icon: <Calendar className="h-5 w-5" />,
                    steps: [
                      'Go to Timeline page and select your project',
                      'Filter by PO number or supplier name',
                      'View manufacturing phases and milestones',
                      'Check real-time status updates',
                      'Click tasks for detailed information',
                    ],
                  },
                ].map((tutorial, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-3">
                        {tutorial.icon}
                      </div>
                      <h3 className="font-semibold text-slate-800">{tutorial.title}</h3>
                    </div>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
                      {tutorial.steps.map((step, j) => (
                        <li key={j}>{step}</li>
                      ))}
                    </ol>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Contact Info */}
            <motion.section
              variants={fadeIn}
              transition={{ delay: 0.5 }}
              className="text-center py-12 bg-slate-50 rounded-xl"
            >
              <div className="max-w-2xl mx-auto px-4">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6"
                >
                  <Mail className="h-8 w-8" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Need Help?</h2>
                <p className="text-slate-600 mb-6">
                  Our support team is here to help you with any questions or issues you might have.
                </p>
                <div className="space-y-3 max-w-md mx-auto">
                  <a
                    href="mailto:support@aseps-asia.org"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Contact Support
                  </a>
                  <p className="text-sm text-slate-500 mt-4">
                    We typically respond within 24 hours on business days.
                  </p>
                </div>
              </div>
            </motion.section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpPage;
