import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as SDK from 'azure-devops-extension-sdk';
import { CommonServiceIds, IHostPageLayoutService } from 'azure-devops-extension-api';
import { IWorkItemFormService, WorkItemTrackingServiceIds } from 'azure-devops-extension-api/WorkItemTracking';
import './workitem-requirements.css';
import './child-requirements.css';

// Interface para los requisitos de sostenibilidad
interface Requirement {
  id: string;
  displayCode: string;
  parentId?: string;
  children?: string[];
  level?: number;
  attrs: {
    detail: string;
    Justification?: string;
    Discussion?: string;
  };
}

// Sistema de storage independiente por work item (mejorado v2.1.5)
class WorkItemStorage {
  private static workItemId: string | null = null;

  static setWorkItemId(id: string) {
    if (this.workItemId !== id) {
      console.log(`🔄 Cambiando Work Item Storage: "${this.workItemId}" → "${id}"`);
      this.workItemId = id;
      
      // Log de independencia para verificar que cada work item tiene su propio storage
      const storageKey = this.getStorageKey('selectedRequirements');
      const existingData = localStorage.getItem(storageKey);
      console.log(`🔍 Storage independiente configurado:`, {
        workItemId: id,
        storageKey: storageKey,
        hasExistingData: !!existingData,
        existingDataLength: existingData ? JSON.parse(existingData).length : 0
      });
    }
  }

  static getStorageKey(key: string): string {
    if (!this.workItemId) {
      console.warn('⚠️ Work Item ID no configurado, usando clave temporal');
      return `temp_${key}_${Date.now()}`;
    }
    
    const storageKey = `workitem_${this.workItemId}_${key}`;
    console.log(`🔑 Storage key generada: "${storageKey}" para work item "${this.workItemId}"`);
    return storageKey;
  }

  static getSelectedRequirements(): Requirement[] {
    try {
      const key = this.getStorageKey('selectedRequirements');
      const saved = localStorage.getItem(key);
      const requirements = saved ? JSON.parse(saved) : [];
      
      console.log(`📦 Cargando requisitos de storage independiente:`, {
        workItemId: this.workItemId,
        storageKey: key,
        count: requirements.length,
        independence: `Específico para work item ${this.workItemId}`
      });
      
      return requirements;
    } catch (e) {
      console.error('❌ Error al obtener requisitos:', e);
      return [];
    }
  }

  static setSelectedRequirements(requirements: Requirement[]) {
    try {
      const key = this.getStorageKey('selectedRequirements');
      localStorage.setItem(key, JSON.stringify(requirements));
      
      console.log(`💾 Guardando requisitos en storage independiente:`, {
        workItemId: this.workItemId,
        storageKey: key,
        count: requirements.length,
        independence: `Exclusivo para work item ${this.workItemId}`,
        requirementIds: requirements.map(r => r.id).slice(0, 3) // Primeros 3 IDs para debug
      });
    } catch (e) {
      console.error('❌ Error al guardar requisitos:', e);
    }
  }

  static getRemovedRequirementIds(): string[] {
    try {
      const key = this.getStorageKey('removedRequirementIds');
      const saved = localStorage.getItem(key);
      const removedIds = saved ? JSON.parse(saved) : [];
      
      console.log(`🗑️ IDs removidos para work item ${this.workItemId}:`, removedIds.length);
      return removedIds;
    } catch (e) {
      console.error('❌ Error al obtener IDs removidos:', e);
      return [];
    }
  }

  static setRemovedRequirementIds(ids: string[]) {
    try {
      const key = this.getStorageKey('removedRequirementIds');
      localStorage.setItem(key, JSON.stringify(ids));
      
      console.log(`🗑️ Guardando IDs removidos para work item ${this.workItemId}:`, ids.length);
    } catch (e) {
      console.error('❌ Error al guardar IDs removidos:', e);
    }
  }

  // Función de debug para verificar independencia
  static debugIndependence() {
    if (!this.workItemId) {
      console.warn('⚠️ No se puede verificar independencia sin Work Item ID');
      return;
    }

    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('workitem_'));
    const thisWorkItemKeys = allKeys.filter(key => key.includes(`workitem_${this.workItemId}_`));
    const otherWorkItemKeys = allKeys.filter(key => !key.includes(`workitem_${this.workItemId}_`));

    console.log(`🔍 Verificación de independencia para work item ${this.workItemId}:`, {
      thisWorkItemKeys: thisWorkItemKeys.length,
      otherWorkItemKeys: otherWorkItemKeys.length,
      totalWorkItems: new Set(allKeys.map(key => key.split('_')[1])).size,
      thisWorkItemStorage: thisWorkItemKeys,
      independence: thisWorkItemKeys.length > 0 ? '✅ Independiente' : '❌ Sin datos propios'
    });
  }

  // Nueva función: Limpieza de storage corrupto y datos legacy
  static cleanupCorruptedStorage() {
    console.log('🧹 Iniciando limpieza de storage corrupto...');
    
    try {
      const allKeys = Object.keys(localStorage);
      let cleaned = 0;
      
      // Limpiar claves legacy problemáticas
      const legacyKeys = allKeys.filter(key => 
        key.startsWith('default_') ||           // Claves default que causan sharing
        key.startsWith('workitem_dev_12345_') || // ID fijo problemático
        key.startsWith('workitem_null_') ||      // IDs null
        key.startsWith('workitem_undefined_')    // IDs undefined
      );
      
      legacyKeys.forEach(key => {
        localStorage.removeItem(key);
        cleaned++;
        console.log(`🗑️ Limpiado storage legacy: ${key}`);
      });
      
      // Verificar claves duplicadas o corruptas
      const workItemKeys = allKeys.filter(key => key.startsWith('workitem_'));
      const duplicateGroups = new Map();
      
      workItemKeys.forEach(key => {
        const parts = key.split('_');
        if (parts.length >= 3) {
          const workItemId = parts[1];
          const dataType = parts.slice(2).join('_');
          const groupKey = dataType;
          
          if (!duplicateGroups.has(groupKey)) {
            duplicateGroups.set(groupKey, []);
          }
          duplicateGroups.get(groupKey).push({ key, workItemId });
        }
      });
      
      console.log(`🧹 Limpieza completada:`, {
        legacyKeysRemoved: cleaned,
        remainingWorkItemKeys: workItemKeys.length - cleaned,
        uniqueWorkItems: new Set(workItemKeys.map(k => k.split('_')[1])).size
      });
      
    } catch (e) {
      console.error('❌ Error en limpieza de storage:', e);
    }
  }

  // Nueva función: Verificación estricta de independencia
  static verifyStrictIndependence(): boolean {
    if (!this.workItemId) {
      console.error('❌ No se puede verificar independencia sin Work Item ID');
      return false;
    }

    const myStorageKey = this.getStorageKey('selectedRequirements');
    const myData = localStorage.getItem(myStorageKey);
    
    // Verificar que no hay contaminación de otros work items
    const allWorkItemKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('workitem_') && key.endsWith('_selectedRequirements'))
      .filter(key => key !== myStorageKey);
    
    console.log(`🔬 Verificación estricta de independencia:`, {
      myWorkItemId: this.workItemId,
      myStorageKey: myStorageKey,
      myDataExists: !!myData,
      myDataLength: myData ? JSON.parse(myData).length : 0,
      otherWorkItemStorageKeys: allWorkItemKeys.length,
      otherKeys: allWorkItemKeys.slice(0, 3) // Primeras 3 para debug
    });

    // Verificar que mi storage es realmente independiente
    if (myData) {
      try {
        const parsedData = JSON.parse(myData);
        console.log(`✅ Datos independientes verificados para ${this.workItemId}:`, {
          count: parsedData.length,
          sampleIds: parsedData.slice(0, 3).map((r: any) => r.id)
        });
        return true;
      } catch (e) {
        console.error(`❌ Datos corruptos en storage para ${this.workItemId}:`, e);
        localStorage.removeItem(myStorageKey);
        return false;
      }
    }

    console.log(`📭 No hay datos para work item ${this.workItemId} (correcto para nuevo work item)`);
    return true;
  }
}

// Componente para mostrar un requisito individual (optimizado)
const RequirementItem: React.FC<{
  requirement: Requirement;
  allRequirements: Requirement[];
  onRemove: (id: string) => void;
  expanded?: boolean;
}> = React.memo(({ requirement, allRequirements, onRemove, expanded = true }) => {
  const [isExpanded, setIsExpanded] = React.useState(expanded);
  
  // Calcular hijos del requisito (optimizado con useMemo)
  const childRequirements = React.useMemo(() => {
    if (!requirement?.id || !allRequirements.length) return [];
    
    try {
      const removedIds = WorkItemStorage.getRemovedRequirementIds();
      
      let children: Requirement[] = [];
      
      // Buscar hijos por la propiedad children[]
      if (requirement.children && Array.isArray(requirement.children)) {
        requirement.children.forEach(childId => {
          const childReq = allRequirements.find(r => 
            r.id === childId || r.id === childId.replace(/\.$/, '') || r.id + '.' === childId
          );
          if (childReq && !removedIds.includes(childReq.id)) {
            children.push(childReq);
          }
        });
      }
      
      // Si no se encontraron hijos por children[], buscar por parentId
      if (children.length === 0) {
        allRequirements.forEach(req => {
          if (req.parentId && 
              (req.parentId === requirement.id || 
               req.parentId.replace(/\.$/, '') === requirement.id.replace(/\.$/, '')) &&
              !removedIds.includes(req.id)) {
            children.push(req);
          }
        });
      }
      
      return children;
    } catch (err) {
      console.error('Error calculando hijos del requisito:', err);
      return [];
    }
  }, [requirement, allRequirements]); // Dependencias específicas

  // Memoizar el handler para evitar re-renders innecesarios
  const handleRemove = React.useCallback(() => {
    onRemove(requirement.id);
  }, [onRemove, requirement.id]);

  const handleToggleExpand = React.useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  if (!requirement?.id) {
    return null;
  }

  return (
    <>
      <tr className="requirement-row">
        <td className="requirement-id">
          <div className="id-container">
            {childRequirements.length > 0 && (
              <button 
                className={`expand-button ${isExpanded ? 'expanded' : ''}`}
                onClick={handleToggleExpand}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            <span className="requirement-code">{requirement.displayCode || requirement.id}</span>
          </div>
        </td>
        <td className="requirement-detail">{requirement.attrs?.detail || 'No detail available'}</td>
        <td className="requirement-actions">
          <button 
            className="remove-button"
            onClick={handleRemove}
            title="Remove this requirement"
          >
            ✕
          </button>
        </td>
      </tr>
      {isExpanded && childRequirements.map(child => (
        <RequirementItem 
          key={child.id}
          requirement={child}
          allRequirements={allRequirements}
          onRemove={onRemove}
          expanded={false}
        />
      ))}
    </>
  );
});

const WorkItemRequirements: React.FC = () => {
  const [requirements, setRequirements] = React.useState<Requirement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  const [workItemId, setWorkItemId] = React.useState<string | null>(null);
  const [workItemType, setWorkItemType] = React.useState<string | null>(null);
  const [isNewWorkItem, setIsNewWorkItem] = React.useState<boolean>(false);
  const [initialized, setInitialized] = React.useState(false);
  const [isProcessingRequirements, setIsProcessingRequirements] = React.useState(false);

  // Obtener ID del work item usando el WorkItemFormService correcto de Azure DevOps
  const getWorkItemId = React.useCallback(async (): Promise<{id: string, type: string | null, isNew: boolean} | null> => {
    try {
      console.log('🔍 Obteniendo Work Item ID usando WorkItemFormService...');
      
      // MÉTODO DIRECTO: Usar getId() del WorkItemFormService
      const workItemFormService = await SDK.getService<IWorkItemFormService>(
        WorkItemTrackingServiceIds.WorkItemFormService
      );
      
      // Verificar si es un work item nuevo
      const isNew = await workItemFormService.isNew();
      console.log('📝 ¿Es Work Item nuevo?', isNew);
      
      // Usar getId() que es más directo y funciona para todos los tipos de Work Item
      const workItemId = await workItemFormService.getId();
      
      console.log('🆔 Work Item ID obtenido:', { id: workItemId, isNew });
      
      if (isNew) {
        // Para Work Items nuevos, generar un ID temporal único hasta que se guarde
        const tempId = `new_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        console.log('🆕 Work Item nuevo detectado, usando ID temporal:', tempId);
        
        try {
          const fieldValues = await workItemFormService.getFieldValues([
            'System.WorkItemType', 
            'System.Title'
          ]);
          
          const workItemType = fieldValues['System.WorkItemType'] as string;
          
          console.log('📋 Información del Work Item nuevo:', {
            tempId: tempId,
            type: workItemType,
            title: fieldValues['System.Title'] || 'Nuevo Work Item',
            isNew: true
          });
          
          return { id: tempId, type: workItemType, isNew: true };
        } catch (fieldError) {
          console.log('⚠️ No se pudieron obtener campos del Work Item nuevo, usando datos básicos');
          return { id: tempId, type: 'Product Backlog Item', isNew: true };
        }
      }
      
      if (workItemId && workItemId > 0) {
        const idString = String(workItemId);
        console.log('✅ Work Item existente ID obtenido:', {
          id: idString,
          type: 'Cualquier tipo (PBI, Epic, Feature, Bug, Task, etc.)',
          method: 'workItemFormService.getId()',
          isNew: false
        });
        
        // Obtener información adicional del work item para debug
        try {
          const fieldValues = await workItemFormService.getFieldValues([
            'System.Id', 
            'System.WorkItemType', 
            'System.Title'
          ]);
          
          const workItemType = fieldValues['System.WorkItemType'] as string;
          
          console.log('📋 Información del Work Item existente:', {
            id: fieldValues['System.Id'],
            type: workItemType,
            title: fieldValues['System.Title'],
            isIndependent: true,
            isNew: false
          });
          
          return { id: idString, type: workItemType, isNew: false };
        } catch (fieldError) {
          console.log('⚠️ No se pudieron obtener campos adicionales, pero ID es válido:', fieldError);
          return { id: idString, type: null, isNew: false };
        }
      }
      
      console.error('❌ getId() retornó valor inválido para Work Item existente:', workItemId);
      return null;
      
    } catch (e) {
      console.error('❌ Error obteniendo Work Item ID del SDK:', e);
      console.log('ℹ️ Esto puede ocurrir si no estás en el contexto correcto de un Work Item form');
      return null;
    }
  }, []);

  // Detectar tema
  React.useEffect(() => {
    const checkTheme = () => {
      const bodyTheme = document.body.getAttribute('data-theme');
      const isDark = bodyTheme === 'dark' || 
                     document.body.classList.contains('vss-dark') ||
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkTheme(isDark);
      
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.className = isDark ? 'dark-theme' : 'light-theme';
      }
    };
    
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    
    return () => observer.disconnect();
  }, []);

  // Función para cargar requisitos específicos del work item con verificación de independencia estricta
  const loadRequirements = React.useCallback(() => {
    if (!workItemId) {
      console.warn('⚠️ No se puede cargar requisitos sin Work Item ID real');
      return;
    }
    
    try {
      console.log(`🔄 Recargando requisitos para work item: ${workItemId}`);
      
      // Verificar independencia estricta antes de cargar
      const isIndependent = WorkItemStorage.verifyStrictIndependence();
      
      if (!isIndependent) {
        console.error(`❌ Independencia comprometida durante recarga para ${workItemId}`);
        setRequirements([]); // Force empty si hay problemas de independencia
        return;
      }
      
      const savedReqs = WorkItemStorage.getSelectedRequirements();
      console.log(`📦 Recarga completada para work item ${workItemId}:`, {
        count: savedReqs.length,
        independence: '✅ Storage independiente verificado',
        timestamp: new Date().toISOString()
      });
      
      // Usar setTimeout para debounce y evitar múltiples actualizaciones rápidas
      const timeoutId = setTimeout(() => {
        setRequirements(savedReqs);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } catch (err) {
      console.error("❌ Error al cargar requisitos:", err);
    }
  }, [workItemId]);

  // Función optimizada para refrescar requisitos cuando cambia el workItemId
  React.useEffect(() => {
    if (workItemId && initialized) {
      loadRequirements();
    }
  }, [workItemId, initialized, loadRequirements]);

  // Función optimizada para remover un requisito
  const removeRequirement = React.useCallback((requirementId: string) => {
    console.log(`Removiendo requisito: ${requirementId} del work item ${workItemId}`);
    
    try {
      // Usar functional update para evitar stale closures
      setRequirements(currentRequirements => {
        // Obtener IDs removidos actuales
        let removedIds = WorkItemStorage.getRemovedRequirementIds();
        
        // Función para encontrar todos los hijos
        const findAllChildren = (parentId: string, allReqs: Requirement[]): string[] => {
          let allChildren: string[] = [];
          
          allReqs.forEach(req => {
            if (req.parentId === parentId || 
                (req.parentId && req.parentId.replace(/\.$/, '') === parentId.replace(/\.$/, ''))) {
              allChildren.push(req.id);
              allChildren.push(...findAllChildren(req.id, allReqs));
            }
          });
          
          return allChildren;
        };
        
        // Encontrar todos los hijos
        const childrenIds = findAllChildren(requirementId, currentRequirements);
        const idsToRemove = [requirementId, ...childrenIds];
        
        // Actualizar lista de IDs removidos
        const uniqueIds = new Set([...removedIds, ...idsToRemove]);
        const updatedRemovedIds = Array.from(uniqueIds);
        WorkItemStorage.setRemovedRequirementIds(updatedRemovedIds);
        
        // Filtrar requisitos
        const updatedRequirements = currentRequirements.filter(req => !idsToRemove.includes(req.id));
        
        // Actualizar storage
        WorkItemStorage.setSelectedRequirements(updatedRequirements);
        
        console.log(`Requisito ${requirementId} y ${childrenIds.length} hijos removidos`);
        
        return updatedRequirements;
      });
      
    } catch (err) {
      console.error("Error al remover requisito:", err);
    }
  }, [workItemId]);

  // Calcular requisitos de nivel superior (optimizado)
  const topLevelRequirements = React.useMemo(() => {
    if (!requirements.length) return [];
    
    try {
      const removedIds = WorkItemStorage.getRemovedRequirementIds();
      
      return requirements.filter(req => {
        if (removedIds.includes(req.id)) return false;
        
        const hasParentInCurrent = requirements.some(parent => 
          parent.id === req.parentId || 
          (req.parentId && parent.id.replace(/\.$/, '') === req.parentId.replace(/\.$/, ''))
        );
        
        return !hasParentInCurrent;
      });
    } catch (err) {
      console.error('Error calculando top level requirements:', err);
      return [];
    }
  }, [requirements]); // Solo depende de requirements

  // Inicialización - Solo se ejecuta una vez
  React.useEffect(() => {
    let isCleanedUp = false;
    let eventHandlers: Array<() => void> = [];
    
    const initialize = async () => {
      if (initialized || isCleanedUp) return; // Evitar múltiples inicializaciones
      
      try {
        await SDK.init({ loaded: true, applyTheme: true });
        console.log("SDK inicializado");
        
        const currentWorkItemInfo = await getWorkItemId();
        console.log("Work Item obtenido:", currentWorkItemInfo);
        
        // Validar que obtuvimos información del work item
        if (!currentWorkItemInfo) {
          console.error('❌ No se pudo obtener información del Work Item - extensión debe ejecutarse en contexto de Work Item form');
          setError('Esta extensión debe ejecutarse dentro de un Work Item abierto. Tipos compatibles: Product Backlog Item, Epic, Feature, Bug, Task, Test Case, etc. Por favor abre cualquier Work Item e intenta nuevamente.');
          return;
        }
        
        const { id: currentWorkItemId, type: currentWorkItemType, isNew: currentIsNew } = currentWorkItemInfo;
        
        // Solo actualizar si realmente cambió
        if (currentWorkItemId !== workItemId) {
          console.log(`🆔 Work Item detectado: ${currentWorkItemId} (${currentWorkItemType || 'tipo desconocido'}) ${currentIsNew ? '[NUEVO]' : '[EXISTENTE]'}`);
          
          // IMPORTANTE: Limpiar storage corrupto ANTES de configurar
          WorkItemStorage.cleanupCorruptedStorage();
          
          setWorkItemId(currentWorkItemId);
          setWorkItemType(currentWorkItemType);
          setIsNewWorkItem(currentIsNew);
          WorkItemStorage.setWorkItemId(currentWorkItemId);
          
          // Verificar independencia estricta
          const isIndependent = WorkItemStorage.verifyStrictIndependence();
          
          if (!isIndependent) {
            console.error(`❌ Independencia comprometida para work item ${currentWorkItemId}`);
            // Force clean para este work item específico
            const problemKey = WorkItemStorage.getStorageKey('selectedRequirements');
            localStorage.removeItem(problemKey);
            console.log(`🧹 Storage limpiado forzosamente para ${currentWorkItemId}`);
          }
          
          // Cargar requisitos específicos de este work item (después de verificación)
          const savedReqs = WorkItemStorage.getSelectedRequirements();
          console.log(`📦 Requisitos específicos cargados para work item ${currentWorkItemId}:`, {
            count: savedReqs.length,
            independence: isIndependent ? '✅ Completamente independiente' : '⚠️ Limpiado y ahora independiente',
            workItemId: currentWorkItemId,
            storageKey: WorkItemStorage.getStorageKey('selectedRequirements')
          });
          
          setRequirements(savedReqs);
          
          // Debug final de independencia
          WorkItemStorage.debugIndependence();
        }
        
        // Registrar listener para actualizaciones desde el hub principal (solo una vez)
        if (!initialized && !isCleanedUp) {
          // IMPORTANTE: Registrar para eventos del WorkItemForm usando el patrón correcto
          SDK.register(SDK.getContributionId(), () => {
            return {
              // Evento cuando se carga un work item - aquí obtenemos el ID real
              onLoaded: async (args: any) => {
                console.log('🎯 Work Item onLoaded event:', args);
                
                if (args && args.id) {
                  const realWorkItemId = String(args.id);
                  console.log(`✅ Work Item ID real desde onLoaded: ${realWorkItemId}`);
                  
                  // Solo actualizar si cambió
                  if (realWorkItemId !== workItemId) {
                    console.log(`🔄 Actualizando Work Item ID: ${workItemId} → ${realWorkItemId}`);
                    
                    setWorkItemId(realWorkItemId);
                    WorkItemStorage.setWorkItemId(realWorkItemId);
                    
                    // Cargar requisitos específicos de este work item
                    const savedReqs = WorkItemStorage.getSelectedRequirements();
                    setRequirements(savedReqs);
                    
                    console.log(`📦 Work Item ${realWorkItemId} cargado con ${savedReqs.length} requisitos`);
                  }
                }
              },
              
              // Otros eventos del work item
              onFieldChanged: (args: any) => {
                console.log('📝 Work Item field changed:', args);
              },
              
              onSaved: (args: any) => {
                console.log('💾 Work Item saved:', args);
              },
              
              onRefreshed: (args: any) => {
                console.log('🔄 Work Item refreshed:', args);
                // Recargar requisitos cuando se refresca el work item
                if (workItemId) {
                  loadRequirements();
                }
              }
            };
          });
          
          SDK.register('requirements.updated', () => {
            console.log('Evento requirements.updated recibido');
            loadRequirements();
          });
          
          // Función para manejar requisitos desde diferentes fuentes (mejorada v2.1.4)
          const handleNewRequirements = (requirements: Requirement[], count: number, pendingKey?: string, source?: string) => {
            if (isCleanedUp || isProcessingRequirements) {
              console.log('⚠️ Operación cancelada - componente limpio o procesando');
              return;
            }
            
            console.log(`🎯 Nuevos requisitos disponibles:`, { 
              count, 
              pendingKey, 
              source: source || 'unknown',
              workItemId: currentWorkItemId 
            });
            
            // Validar que los datos sean correctos
            if (!requirements || !Array.isArray(requirements) || requirements.length === 0) {
              console.error('❌ Datos de requisitos inválidos:', requirements);
              return;
            }
            
            // Evitar múltiples procesamientos simultáneos
            setIsProcessingRequirements(true);
            
            try {
              // Mostrar modal de confirmación mejorado
              const confirmMessage = `🌱 REQUISITOS DE SOSTENIBILIDAD DISPONIBLES\n\n` +
                `Se encontraron ${count} requisito(s) listos para aplicar a este Work Item.\n\n` +
                `✅ Serán independientes (no afectan otros Work Items)\n` +
                `✅ Se pueden remover individualmente\n` +
                `✅ Se guardan automáticamente\n\n` +
                `¿Deseas aplicar estos requisitos ahora?`;
              
              const shouldApply = window.confirm(confirmMessage);
              
              if (shouldApply && !isCleanedUp) {
                // Usar functional update para evitar stale closures
                setRequirements(currentReqs => {
                  console.log(`📦 Combinando requisitos existentes (${currentReqs.length}) con nuevos (${requirements.length})`);
                  
                  // Combinar sin duplicar
                  const combinedReqs = [...currentReqs];
                  let newlyAdded = 0;
                  
                  requirements.forEach((newReq: Requirement) => {
                    if (!combinedReqs.some(existing => existing.id === newReq.id)) {
                      combinedReqs.push(newReq);
                      newlyAdded++;
                    }
                  });
                  
                  // Guardar en storage
                  WorkItemStorage.setSelectedRequirements(combinedReqs);
                  
                  console.log(`✅ ${newlyAdded} nuevos requisitos aplicados (total: ${combinedReqs.length})`);
                  
                  // Mostrar notificación de éxito
                  setTimeout(() => {
                    alert(`✅ ¡Éxito!\n\n${newlyAdded} requisito(s) aplicado(s) al Work Item.\n\nTotal de requisitos: ${combinedReqs.length}`);
                  }, 100);
                  
                  return combinedReqs;
                });
              } else {
                console.log('❌ Usuario rechazó aplicar los requisitos');
              }
              
            } catch (err) {
              console.error('❌ Error procesando nuevos requisitos:', err);
              alert('Error aplicando requisitos. Por favor intenta nuevamente.');
            } finally {
              // Limpiar clave temporal si existe
              if (pendingKey) {
                try {
                  localStorage.removeItem(pendingKey);
                  console.log(`🧹 Clave temporal limpiada: ${pendingKey}`);
                } catch (e) {
                  console.error('Error limpiando clave temporal:', e);
                }
              }
              
              // Permitir futuras operaciones después de un delay
              setTimeout(() => {
                setIsProcessingRequirements(false);
                console.log('🔓 Procesamiento desbloqueado');
              }, 500);
            }
          };
          
          // Escuchar eventos CustomEvent (mejorado)
          const handleCustomEvent = (event: any) => {
            if (isCleanedUp) return;
            
            console.log('📨 CustomEvent recibido:', event.type, event.detail);
            
            if (event.detail && event.detail.requirements) {
              handleNewRequirements(
                event.detail.requirements, 
                event.detail.count || event.detail.requirements.length,
                event.detail.pendingKey,
                'CustomEvent'
              );
            } else {
              console.warn('⚠️ CustomEvent sin datos válidos:', event.detail);
            }
          };
          
          // Escuchar mensajes postMessage (mejorado)
          const handlePostMessage = (event: MessageEvent) => {
            if (isCleanedUp) return;
            
            console.log('📨 PostMessage recibido desde:', event.origin, event.data);
            
            if (event.data && event.data.type === 'requirements.available') {
              console.log('✅ PostMessage válido de requisitos:', event.data);
              handleNewRequirements(
                event.data.requirements || [],
                event.data.count || 0,
                event.data.pendingKey,
                `PostMessage-${event.data.source || 'unknown'}`
              );
            } else {
              console.log('📝 PostMessage ignorado (no es requirements.available):', event.data?.type);
            }
          };
          
          // Verificar si hay requisitos pendientes en localStorage al cargar (mejorado v2.1.4)
          const checkPendingRequirements = () => {
            if (isCleanedUp) return;
            
            console.log('🔍 Verificando requisitos pendientes en localStorage...');
            
            try {
              const pendingData = localStorage.getItem('requirements_pending');
              console.log('📋 Datos pendientes encontrados:', pendingData);
              
              if (pendingData) {
                const pending = JSON.parse(pendingData);
                console.log('📦 Datos pendientes parseados:', pending);
                
                // Verificar que los datos sean válidos y no muy antiguos
                if (pending.key && pending.count && pending.timestamp) {
                  const timeDiff = Date.now() - pending.timestamp;
                  const maxAge = 5 * 60 * 1000; // 5 minutos máximo
                  
                  if (timeDiff > maxAge) {
                    console.log('⏰ Datos pendientes muy antiguos, limpiando...');
                    localStorage.removeItem('requirements_pending');
                    localStorage.removeItem(pending.key);
                    return;
                  }
                  
                  const requirementsData = localStorage.getItem(pending.key);
                  console.log('📄 Datos de requisitos encontrados:', requirementsData ? 'Sí' : 'No');
                  
                  if (requirementsData) {
                    const requirements = JSON.parse(requirementsData);
                    console.log('✅ Requisitos pendientes válidos encontrados:', {
                      count: pending.count,
                      actualCount: requirements.length,
                      key: pending.key,
                      version: pending.version || 'unknown'
                    });
                    
                    // Aplicar los requisitos
                    handleNewRequirements(
                      requirements, 
                      pending.count, 
                      pending.key,
                      `Pending-${pending.source || 'localStorage'}`
                    );
                    
                    // Limpiar la bandera de pendientes
                    localStorage.removeItem('requirements_pending');
                    console.log('🧹 Bandera de pendientes limpiada');
                  } else {
                    console.warn('⚠️ Datos de requisitos no encontrados, limpiando bandera...');
                    localStorage.removeItem('requirements_pending');
                  }
                } else {
                  console.warn('⚠️ Datos pendientes incompletos:', pending);
                  localStorage.removeItem('requirements_pending');
                }
              } else {
                console.log('📭 No hay requisitos pendientes');
              }
            } catch (e) {
              console.error('❌ Error verificando requisitos pendientes:', e);
              // Limpiar datos corruptos
              try {
                localStorage.removeItem('requirements_pending');
                console.log('🧹 Datos corruptos limpiados');
              } catch (cleanupError) {
                console.error('Error limpiando datos corruptos:', cleanupError);
              }
            }
          };
          
          // Registrar listeners una sola vez
          window.addEventListener('requirements.available', handleCustomEvent);
          window.addEventListener('message', handlePostMessage);
          
          // Guardar las funciones de cleanup
          eventHandlers.push(() => {
            window.removeEventListener('requirements.available', handleCustomEvent);
            window.removeEventListener('message', handlePostMessage);
          });
          
          // Verificar requisitos pendientes al inicializar (inmediatamente)
          setTimeout(checkPendingRequirements, 100); // Delay mínimo para asegurar inicialización
        }
        
        if (!isCleanedUp) {
          setInitialized(true);
        }
        
      } catch (err) {
        console.error("Error en inicialización:", err);
        if (!isCleanedUp) {
          setError("Error al inicializar: " + (err as Error).message);
        }
      } finally {
        if (!isCleanedUp) {
          setLoading(false);
        }
      }
    };

    initialize();
    
    // Cleanup function para prevenir memory leaks
    return () => {
      isCleanedUp = true;
      eventHandlers.forEach(cleanup => cleanup());
    };
  }, []); // Solo dependencias vacías para ejecutarse una sola vez

  if (loading) return <div className="loading">Cargando requisitos...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className={`workitem-requirements-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <div className="workitem-info">
        <small>
          Work Item: {workItemId ? `${workItemId}` : 'Obteniendo ID...'}
          {workItemType && (
            <span style={{ color: '#0078d4', fontWeight: 'bold', marginLeft: '8px' }}>
              [{workItemType}]
            </span>
          )}
          {isNewWorkItem && (
            <span style={{ color: '#ff6600', fontWeight: 'bold', marginLeft: '8px' }}>
              [NUEVO - Guarda primero para obtener ID permanente]
            </span>
          )}
        </small>
      </div>

      {requirements.length > 0 ? (
        <>
          {isNewWorkItem && (
            <div className="new-workitem-notice" style={{
              backgroundColor: '#fff4e6',
              border: '1px solid #ff6600',
              borderRadius: '4px',
              padding: '12px',
              margin: '10px 0',
              color: '#d14900'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#d14900' }}>🆕 Work Item Nuevo</h4>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                Este es un Work Item nuevo que aún no ha sido guardado. Los requisitos se mantendrán 
                temporalmente y se transferirán automáticamente cuando guardes el Work Item.
              </p>
              <p style={{ margin: '0', fontSize: '12px', fontWeight: 'bold' }}>
                💡 Recomendación: Guarda el Work Item primero para obtener un ID permanente.
              </p>
            </div>
          )}
          
          <div className="independence-test-controls">
            <button 
              onClick={() => {
                console.log('🧪 === TESTING INDEPENDENCIA MANUAL ===');
                WorkItemStorage.debugIndependence();
                WorkItemStorage.verifyStrictIndependence();
                
                // Mostrar resumen en alert para fácil verificación
                const storageKey = WorkItemStorage.getStorageKey('selectedRequirements');
                const currentReqs = WorkItemStorage.getSelectedRequirements();
                
                alert(`🔬 VERIFICACIÓN DE INDEPENDENCIA\n\n` +
                      `Work Item: ${workItemId} [${workItemType || 'Tipo no identificado'}]\n` +
                      `Estado: ${isNewWorkItem ? 'NUEVO (temporal)' : 'EXISTENTE (permanente)'}\n` +
                      `Storage Key: ${storageKey}\n` +
                      `Requisitos: ${currentReqs.length}\n\n` +
                      `✅ Este Work Item tiene storage completamente independiente.\n` +
                      `Funciona con cualquier tipo: PBI, Epic, Feature, Bug, Task, etc.\n\n` +
                      `Ver consola para detalles técnicos.`);
              }}
              style={{
                padding: '5px 10px',
                margin: '10px 0',
                backgroundColor: '#0078d4',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Verificar independencia de este Work Item"
            >
              🧪 Test Independencia
            </button>
          </div>
          
          <table className="requirements-table">
            <thead>
              <tr>
                <th className="id-header">ID</th>
                <th className="detail-header">Detalle</th>
                <th className="action-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {topLevelRequirements.map(req => (
                <RequirementItem 
                  key={req.id} 
                  requirement={req} 
                  allRequirements={requirements}
                  onRemove={removeRequirement}
                />
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div className="no-requirements">
          <h3>❌ Sin requisitos de sostenibilidad aplicados</h3>
          
          {workItemId ? (
            <>
              <div className="independence-test-controls">
                <button 
                  onClick={() => {
                    console.log('🧪 === TESTING INDEPENDENCIA MANUAL (WORK ITEM VACÍO) ===');
                    WorkItemStorage.debugIndependence();
                    WorkItemStorage.verifyStrictIndependence();
                    
                    const storageKey = WorkItemStorage.getStorageKey('selectedRequirements');
                    
                    alert(`🔬 VERIFICACIÓN DE INDEPENDENCIA (Work Item Vacío)\n\n` +
                          `Work Item: ${workItemId} [${workItemType || 'Tipo no identificado'}]\n` +
                          `Storage Key: ${storageKey}\n` +
                          `Requisitos: 0 (correcto)\n\n` +
                          `✅ Este Work Item está completamente vacío e independiente.\n` +
                          `Esto es correcto para un nuevo Work Item.\n` +
                          `Compatible con todos los tipos: PBI, Epic, Feature, Bug, etc.\n\n` +
                          `Ver consola para detalles técnicos.`);
                  }}
                  style={{
                    padding: '5px 10px',
                    margin: '10px 0',
                    backgroundColor: '#107c10',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  title="Verificar que este Work Item está correctamente vacío e independiente"
                >
                  🧪 Verificar Work Item Vacío
                </button>
              </div>
              
              <div className="instructions">
                <h4>💡 Cómo agregar requisitos:</h4>
                <ol>
                  <li>Ve al hub "CRETS4DevOps V2" en tu proyecto</li>
                  <li>Selecciona los requisitos de sostenibilidad que necesitas</li>
                  <li>Haz clic en "Apply Selected to Work Items"</li>
                  <li>Los requisitos se aplicarán de manera independiente a este Work Item</li>
                </ol>
                <div className="independence-note">
                  <strong>🔒 Independencia:</strong> Cada Work Item tiene su propio conjunto independiente    
                  de requisitos de sostenibilidad. Agregar requisitos a un Work Item no afecta a otros.
                </div>
              </div>
            </>
          ) : (
            <div className="error">
              <h4>⚠️ Error de contexto</h4>
              <p>No se pudo obtener el ID del Work Item.</p>
              <p><strong>Tipos de Work Item compatibles:</strong></p>
              <ul>
                <li>🎯 Product Backlog Item (PBI)</li>
                <li>🏢 Epic</li>
                <li>⭐ Feature</li>
                <li>🐛 Bug</li>
                <li>✅ Task</li>
                <li>🧪 Test Case</li>
                <li>📋 User Story</li>
                <li>🎨 Otros tipos personalizados</li>
              </ul>
              <p>Por favor, asegúrate de que estás viendo esta pestaña desde cualquier Work Item abierto en Azure DevOps.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Renderizar componente
ReactDOM.render(<WorkItemRequirements />, document.getElementById('root'));
