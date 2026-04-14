import { registerRootComponent } from 'expo'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PaperProvider } from 'react-native-paper'

import App from './src/App'

function Root() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <App />
      </PaperProvider>
    </SafeAreaProvider>
  )
}

registerRootComponent(Root)
