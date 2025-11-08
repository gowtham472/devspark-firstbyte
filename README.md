# ByteHub 📚

> **Knowledge sharing for students** - A GitHub-inspired platform where students upload, organize, and share study materials, notes, and educational resources.

ByteHub is a modern, collaborative platform designed specifically for students to create, share, and discover educational content. Built with Next.js 16 and Firebase, it provides a seamless experience for managing study materials in organized "hubs" with powerful community features.

![ByteHub Banner](https://via.placeholder.com/800x400/3b82f6/white?text=ByteHub+-+Knowledge+Sharing+Platform)

## ✨ Features

### 🔐 **User Management & Authentication**

- **Google OAuth Integration** - Quick sign-up with Google accounts
- **Email Authentication** - Traditional email/password authentication
- **User Profiles** - Customizable profiles with bio, institution, and social links
- **Email Verification** - Secure account verification process

### 📚 **Study Hub Management**

- **Create Study Hubs** - Organize materials into themed collections
- **File Upload & Management** - Support for multiple file types with drag-and-drop
- **Version Control** - Track changes to study materials over time
- **Privacy Controls** - Set hubs as public or private
- **Tagging System** - Categorize content with custom tags
- **Rich Descriptions** - Add detailed descriptions with formatting support

### 🔍 **Discovery & Search**

- **Advanced Search** - Find content by title, description, tags, or author
- **Trending Content** - Discover popular and recently updated hubs
- **Tag-based Filtering** - Browse content by categories and subjects
- **User Discovery** - Find and follow other students

### ⭐ **Community Features**

- **Star System** - Bookmark and rate quality content
- **Follow Users** - Stay updated with favorite contributors
- **Comments & Discussions** - Engage with content through comments
- **Collaboration Requests** - Request to collaborate on study hubs
- **Activity Feed** - Track updates from followed users

### 📊 **Analytics & Insights**

- **View Tracking** - Monitor hub popularity and engagement
- **Download Statistics** - Track content usage
- **User Analytics** - View profile statistics and activity
- **Hub History** - Track changes and updates over time

### 🛡️ **Security & Privacy**

- **Firebase Security Rules** - Robust data protection
- **Content Moderation** - Safe and appropriate content sharing
- **Privacy Settings** - Granular control over content visibility
- **Secure File Storage** - Cloudinary integration for reliable file hosting

## �️ Routes & Navigation

### **Public Pages**

| Route                 | Description                                   | Access Level |
| --------------------- | --------------------------------------------- | ------------ |
| `/`                   | Landing page with feature overview            | Public       |
| `/explore`            | Browse public study hubs and trending content | Public       |
| `/auth`               | Authentication page (login/register)          | Public       |
| `/auth?mode=register` | Registration form                             | Public       |
| `/auth?mode=login`    | Login form                                    | Public       |

### **Protected Pages** (Requires Authentication)

| Route                                | Description                                    | Features                              |
| ------------------------------------ | ---------------------------------------------- | ------------------------------------- |
| `/dashboard`                         | User dashboard with personal hubs and activity | Hub management, Quick actions         |
| `/upload`                            | Create new study hub                           | Hub creation form, File upload        |
| `/settings`                          | User profile and account settings              | Profile editing, Privacy controls     |
| `/hub/[hubId]`                       | View individual study hub                      | File viewing, Comments, Stars         |
| `/hub/[hubId]/edit`                  | Edit hub details and manage files              | Hub editing, File management          |
| `/hub/[hubId]/collaborate`           | Collaboration interface                        | Joint editing, Contributor management |
| `/hub/[hubId]/request-collaboration` | Request collaboration access                   | Collaboration requests                |

### **API Endpoints**

#### **Authentication & Users**

| Endpoint                       | Method   | Description                          |
| ------------------------------ | -------- | ------------------------------------ |
| `/api/auth`                    | POST     | User authentication and registration |
| `/api/auth/verify-email`       | POST     | Email verification for new accounts  |
| `/api/users/[userId]`          | GET, PUT | User profile management              |
| `/api/users/[userId]/settings` | GET, PUT | User settings and preferences        |

#### **Study Hubs**

| Endpoint                    | Method           | Description                     |
| --------------------------- | ---------------- | ------------------------------- |
| `/api/hubs`                 | GET, POST        | List hubs, Create new hub       |
| `/api/hubs/[hubId]`         | GET, PUT, DELETE | Hub details, Update, Delete     |
| `/api/hubs/[hubId]/history` | GET              | Hub version history and changes |

#### **File Management**

| Endpoint              | Method      | Description                  |
| --------------------- | ----------- | ---------------------------- |
| `/api/upload`         | POST        | Upload files to Cloudinary   |
| `/api/files`          | GET, POST   | File operations and metadata |
| `/api/files/[fileId]` | GET, DELETE | Individual file operations   |

#### **Community Features**

| Endpoint        | Method                 | Description                     |
| --------------- | ---------------------- | ------------------------------- |
| `/api/stars`    | GET, POST, DELETE      | Star/unstar hubs                |
| `/api/follows`  | GET, POST, DELETE      | Follow/unfollow users           |
| `/api/comments` | GET, POST, PUT, DELETE | Hub comments and discussions    |
| `/api/search`   | GET                    | Search hubs, users, and content |

### **Feature Access Map**

#### **🔐 User Authentication**

- **Sign Up**: `/auth?mode=register`
- **Sign In**: `/auth?mode=login`
- **Profile Management**: `/settings`
- **Email Verification**: Handled via `/api/auth/verify-email`

#### **📚 Hub Management**

- **Create Hub**: `/upload`
- **View Hub**: `/hub/[hubId]`
- **Edit Hub**: `/hub/[hubId]/edit`
- **Hub History**: Available in hub view (API: `/api/hubs/[hubId]/history`)
- **Delete Hub**: Available in hub edit page

#### **🔍 Discovery & Search**

- **Browse Content**: `/explore`
- **Search**: Available on `/explore` and `/dashboard`
- **Advanced Filtering**: Query parameters on `/explore`
- **Trending Content**: Featured section on `/explore`

#### **⭐ Community Interaction**

- **Star Hubs**: Star button on hub pages (`/hub/[hubId]`)
- **Follow Users**: User profile actions throughout the app
- **Comment System**: Available on individual hub pages
- **Collaboration**: `/hub/[hubId]/request-collaboration` and `/hub/[hubId]/collaborate`

#### **📊 Analytics & Monitoring**

- **Personal Analytics**: Available on `/dashboard`
- **Hub Statistics**: Visible on individual hub pages
- **Activity Feed**: Integrated into `/dashboard`
- **View Tracking**: Automatic on hub visits

#### **🛡️ Privacy & Security**

- **Privacy Controls**: `/settings` for account-wide settings
- **Hub Visibility**: Managed in `/hub/[hubId]/edit`
- **Content Moderation**: Backend validation on all content APIs
- **Security Settings**: Available in `/settings`

### **URL Parameters & Query Strings**

#### **Search & Filtering** (`/explore`)

```
/explore?search=react&tags=javascript,tutorial&sort=popular
/explore?userId=123&visibility=public
/explore?limit=20&offset=40
```

#### **Authentication Modes** (`/auth`)

```
/auth?mode=login
/auth?mode=register
/auth?redirect=/dashboard
```

#### **Hub Operations**

```
/hub/abc123                    # View hub
/hub/abc123/edit              # Edit hub
/hub/abc123/collaborate       # Collaborate on hub
/hub/abc123/request-collaboration  # Request access
```

## �🚀 Demo Flow

### **New User Journey**

1. **Landing Page Experience**

   - View animated grid background with feature highlights
   - Learn about ByteHub's core functionality
   - Access "Explore" to browse public content without registration

2. **Registration Process**

   - Click "Get Started" to begin registration
   - Choose between Google OAuth or email registration
   - Complete profile with institution and interests
   - Verify email address (for email registration)

3. **First Hub Creation**

   - Navigate to Dashboard after successful login
   - Click "Create New Hub" to start organizing content
   - Add title, description, and relevant tags
   - Set visibility (public/private)
   - Upload initial files via drag-and-drop

4. **Exploring the Platform**
   - Use search functionality to find relevant content
   - Star interesting hubs for later reference
   - Follow other students in your field
   - Leave comments and engage with the community

### **Collaboration Workflow**

1. **Discovery**

   ```
   Browse Public Hubs → Find Interesting Content → View Hub Details
   ```

2. **Engagement**

   ```
   Star Hub → Follow Author → Leave Comments → Request Collaboration
   ```

3. **Collaboration**

   ```
   Receive Request → Review Proposal → Accept/Decline → Grant Access
   ```

4. **Joint Work**
   ```
   Upload Files → Update Content → Track Changes → Maintain Version History
   ```

## 🛠️ Technical Stack

### **Frontend**

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React features and hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern styling with custom design system
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful SVG icons

### **Backend & Database**

- **Firebase Authentication** - User management and security
- **Firestore** - NoSQL database for scalable data storage
- **Firebase Admin SDK** - Server-side Firebase operations
- **API Routes** - Next.js API endpoints for backend logic

### **File Management**

- **Cloudinary** - Cloud-based file storage and optimization
- **File Upload API** - Secure file handling and processing
- **Version Control** - Track file changes and updates

### **Development Tools**

- **ESLint** - Code quality and consistency
- **TypeScript** - Type checking and IDE support
- **PostCSS** - CSS processing and optimization
- **PNPM** - Fast and efficient package management

## 📋 Getting Started

### **Prerequisites**

- Node.js 18.17 or later
- PNPM (recommended) or npm
- Firebase project with Firestore and Authentication enabled
- Cloudinary account for file storage

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/gowtham472/devspark-firstbyte.git
   cd bytehub
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**
   Create `.env.local` file in the root directory:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin SDK
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email

   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Firebase Setup**

   - Place your `service-account-key.json` in the root directory
   - Configure Firestore security rules
   - Enable Authentication providers (Google, Email)

5. **Start Development Server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

### **Build for Production**

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 📂 Project Structure

```
bytehub/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── hubs/          # Study hub operations
│   │   ├── users/         # User management
│   │   ├── files/         # File operations
│   │   └── ...
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── explore/           # Content discovery
│   ├── hub/               # Hub management pages
│   ├── settings/          # User settings
│   └── ...
├── components/            # Reusable React components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   ├── pages/             # Page-specific components
│   └── ui/                # UI component library
├── contexts/              # React Context providers
├── lib/                   # Utility functions and configurations
│   ├── firebase.ts        # Firebase client configuration
│   ├── firebase-admin.ts  # Firebase Admin SDK setup
│   ├── cloudinary.ts      # Cloudinary configuration
│   ├── database.ts        # Database operations
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Helper functions
└── public/                # Static assets
```

## 🤝 Contributing

We welcome contributions to ByteHub! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- UI components powered by [Radix UI](https://radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Backend services by [Firebase](https://firebase.google.com/)
- File storage by [Cloudinary](https://cloudinary.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**ByteHub** - Empowering students to share knowledge and build learning communities. 🎓✨
