import { createRoot } from 'react-dom/client';
import Flasher from './components/flasher';

const root = createRoot(document.getElementById('root'));
root.render(<>
   <Flasher />
</>);