import { asyncComponent } from 'react-async-component';
import AsyncExample from './AsyncExample';

export default asyncComponent({
  resolve: () => AsyncExample
});