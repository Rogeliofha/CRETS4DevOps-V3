import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as SDK from 'azure-devops-extension-sdk';
import { CommonServiceIds, IHostPageLayoutService } from 'azure-devops-extension-api';

// Componente principal
const App: React.FC = () => {
    const [workItemId, setWorkItemId] = React.useState<number | null>(null);

    // Inicializar el SDK cuando el componente se monta
    React.useEffect(() => {
        SDK.init();
        
        // Inicializar el SDK y obtener el ID del work item actual
        SDK.ready().then(async () => {
            try {
                // Intentar obtener información del work item actual
                const layoutService = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
                const navService = await SDK.getService<any>("ms.vss-features.host-navigation-service");
                
                // Obtener información de la página actual
                const currentHash = await navService.getPageRoute();
                if (currentHash && currentHash.id) {
                    setWorkItemId(parseInt(currentHash.id));
                }
            } catch (error) {
                console.error('Error al inicializar:', error);
            }
        });
    }, []);

    return (
        <div className="container">
            <h1>¡Hola Mundo!</h1>
            {workItemId && <p>Estás viendo el work item #{workItemId}</p>}
            <p>Esta es una extensión de ejemplo para Azure DevOps.</p>
        </div>
    );
};

// Renderizar el componente en el DOM
ReactDOM.render(<App />, document.getElementById('root'));
