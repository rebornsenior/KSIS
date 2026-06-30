import { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Archive from './pages/Archive';
import CalendarPage from './pages/CalendarPage';
import Community from './pages/Board';
import { ROUTES } from './constants';

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!search.includes('goto=gallery') && !search.includes('goto=project')) {
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route path={ROUTES.ARCHIVE} element={<Archive />} />
          <Route path={ROUTES.CALENDAR} element={<CalendarPage />} />
          <Route path={ROUTES.COMMUNITY} element={<Community />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}