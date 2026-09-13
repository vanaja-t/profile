import { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { devRoutes } from 'virtual:dev-routes'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { siteConfig } from '@/lib/content/site-config'
import { getRouterBasename } from '@/lib/base-path'
import { SkipLink } from '@/components/layout/SkipLink'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { HomePage } from '@/pages/HomePage'
import { ResumePage } from '@/pages/ResumePage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { OthersPage } from '@/pages/OthersPage'
import { BlogPage } from '@/pages/BlogPage'
import { BlogPostPage } from '@/pages/BlogPostPage'
import { CustomizePage } from '@/pages/CustomizePage'
import { ThemePreviewPage } from '@/pages/ThemePreviewPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={getRouterBasename(siteConfig.basePath)}>
        <SkipLink />
        <Header />
        <main id="main-content" className="pb-16 sm:pb-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/others" element={<OthersPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/customize" element={<CustomizePage />} />
            <Route path="/theme-preview" element={<ThemePreviewPage />} />
            {devRoutes.map(({ path, Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense fallback={null}>
                    <Component />
                  </Suspense>
                }
              />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <MobileTabBar />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
