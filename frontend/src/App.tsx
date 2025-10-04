import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { Search } from '@/pages/Search'
import { BrowseArticles } from '@/pages/BrowseArticles'
import { ArticleDetail } from '@/pages/ArticleDetail'
import { ReadingList } from '@/pages/ReadingList'
import { Admin } from '@/pages/Admin'
import { Help } from '@/pages/Help'
import { ResearchAgent } from '@/pages/ResearchAgent'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/browse" element={<BrowseArticles />} />
          <Route path="/reading-list" element={<ReadingList />} />
          <Route path="/research-agent" element={<ResearchAgent />} />
          <Route path="/help" element={<Help />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App