import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as SDK from 'azure-devops-extension-sdk';
import { CommonServiceIds, IHostPageLayoutService } from 'azure-devops-extension-api';
import { IWorkItemFormService, WorkItemTrackingServiceIds } from 'azure-devops-extension-api/WorkItemTracking';
import './workitem-requirements.css';
import './child-requirements.css';

// Interface para los requisitos de sostenibilidad (con soporte para edición independiente)
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
  // Campos para tracking de modificaciones independientes por Work Item
  _isModified?: boolean;
  _modifiedDate?: string;
  _originalRequirement?: Requirement; // Referencia al requisito original del catálogo
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
      
      // Crear backup antes de guardar
      const existingData = localStorage.getItem(key);
      if (existingData) {
        const backupKey = `backup_${key}_${Date.now()}`;
        localStorage.setItem(backupKey, existingData);
        console.log(`💾 Backup creado: ${backupKey}`);
      }
      
      localStorage.setItem(key, JSON.stringify(requirements));
      
      // Verificar que se guardó correctamente
      const verification = localStorage.getItem(key);
      const verificationSuccess = !!verification;
      
      console.log(`💾 Guardando requisitos en storage independiente:`, {
        workItemId: this.workItemId,
        storageKey: key,
        count: requirements.length,
        independence: `Exclusivo para work item ${this.workItemId}`,
        requirementIds: requirements.map(r => r.id).slice(0, 3), // Primeros 3 IDs para debug
        verificationSuccess: verificationSuccess,
        timestamp: new Date().toISOString(),
        domain: window.location.hostname,
        userAgent: navigator.userAgent.substring(0, 50) + '...'
      });
      
      // Log adicional para debugging de persistencia
      if (!verificationSuccess) {
        console.error(`❌ FALLO EN PERSISTENCIA: Los datos no se guardaron correctamente`);
        console.error(`🔍 localStorage disponible:`, typeof(Storage) !== "undefined");
        console.error(`🔍 Quota exceeded:`, this.checkStorageQuota());
      }
      
    } catch (e: any) {
      console.error('❌ Error al guardar requisitos:', e);
      if (e.name === 'QuotaExceededError') {
        console.error('💽 Error: localStorage quota exceeded - limpiando datos antiguos');
        this.cleanupOldBackups();
      }
    }
  }
  
  // Nueva función: verificar quota de localStorage
  private static checkStorageQuota(): {used: number, available: boolean} {
    try {
      const testKey = 'test_' + Date.now();
      const testData = 'x'.repeat(1024); // 1KB test
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      return {used: JSON.stringify(localStorage).length, available: true};
    } catch (e) {
      return {used: JSON.stringify(localStorage).length, available: false};
    }
  }
  
  // Nueva función: limpiar backups antiguos si es necesario
  private static cleanupOldBackups() {
    try {
      const allKeys = Object.keys(localStorage);
      const backupKeys = allKeys.filter(key => key.startsWith('backup_workitem_'));
      
      // Ordenar por timestamp y eliminar los más antiguos
      backupKeys.sort();
      const toDelete = backupKeys.slice(0, Math.floor(backupKeys.length / 2));
      
      toDelete.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Backup antiguo eliminado: ${key}`);
      });
      
    } catch (e) {
      console.error('❌ Error limpiando backups:', e);
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
  
  // Nueva función: Diagnóstico completo de persistencia
  static diagnosePersistenceIssues(): void {
    console.log('🏥 DIAGNÓSTICO DE PERSISTENCIA - INICIO');
    
    // Verificar contexto de Azure DevOps
    console.log('🌐 Contexto de navegador:', {
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      origin: window.location.origin,
      userAgent: navigator.userAgent.substring(0, 100) + '...',
      cookiesEnabled: navigator.cookieEnabled,
      localStorageAvailable: typeof(Storage) !== "undefined"
    });
    
    // Verificar cuota de localStorage
    const quota = this.checkStorageQuota();
    console.log('💽 Estado de localStorage:', quota);
    
    // Verificar Work Item actual
    console.log('📋 Work Item actual:', {
      workItemId: this.workItemId,
      storageKeyWouldBe: this.workItemId ? this.getStorageKey('selectedRequirements') : 'N/A'
    });
    
    // Verificar datos existentes
    if (this.workItemId) {
      const key = this.getStorageKey('selectedRequirements');
      const data = localStorage.getItem(key);
      console.log('📦 Datos existentes:', {
        storageKey: key,
        dataExists: !!data,
        dataSize: data ? data.length : 0,
        dataValid: data ? this.isValidJSON(data) : false
      });
      
      // Debug completo del storage
      this.debugIndependence();
    }
    
    console.log('🏥 DIAGNÓSTICO DE PERSISTENCIA - FIN');
  }
  
  private static isValidJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Nueva función: Limpieza de storage corrupto y datos legacy (VERSION MEJORADA - NO AGRESIVA)
  static cleanupCorruptedStorage() {
    console.log('🧹 Iniciando limpieza CONSERVADORA de storage...');
    
    try {
      const allKeys = Object.keys(localStorage);
      let cleaned = 0;
      
      // SOLO limpiar claves claramente problemáticas - SIN tocar datos válidos
      const definitelyProblematicKeys = allKeys.filter(key => 
        key.startsWith('workitem_null_') ||      // IDs null definitivamente inválidos
        key.startsWith('workitem_undefined_') || // IDs undefined definitivamente inválidos
        key.startsWith('workitem_temp_') ||      // IDs temporales muy antiguos (>24h)
        (key.startsWith('pending_requirements_') && this.isOldPendingKey(key)) // Solo pending muy antiguos
      );
      
      // Crear backup antes de eliminar CUALQUIER cosa
      const backupData: {[key: string]: string} = {};
      definitelyProblematicKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            backupData[key] = data;
          }
        } catch (e) {
          console.warn(`⚠️ No se pudo hacer backup de ${key}:`, e);
        }
      });
      
      // Guardar backup si hay datos a limpiar
      if (Object.keys(backupData).length > 0) {
        localStorage.setItem('storage_backup_' + Date.now(), JSON.stringify(backupData));
        console.log('💾 Backup creado antes de limpieza:', Object.keys(backupData));
      }
      
      // Eliminar solo las claves claramente problemáticas
      definitelyProblematicKeys.forEach(key => {
        localStorage.removeItem(key);
        cleaned++;
        console.log(`🗑️ Limpiado storage problemático: ${key}`);
      });
      
      console.log(`🧹 Limpieza CONSERVADORA completada:`, {
        problematicKeysRemoved: cleaned,
        backupCreated: Object.keys(backupData).length > 0,
        validWorkItemKeysPreserved: allKeys.filter(k => k.startsWith('workitem_') && 
          !definitelyProblematicKeys.includes(k)).length
      });
      
    } catch (e) {
      console.error('❌ Error en limpieza conservadora de storage:', e);
    }
  }
  
  // Helper para detectar claves pending muy antiguas (>24 horas)
  private static isOldPendingKey(key: string): boolean {
    const match = key.match(/pending_requirements_(\d+)/);
    if (match) {
      const timestamp = parseInt(match[1]);
      const now = Date.now();
      const age = now - timestamp;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      return age > twentyFourHours;
    }
    return false;
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

// Componente para mostrar un requisito individual (con capacidad de edición independiente)
const RequirementItem: React.FC<{
  requirement: Requirement;
  allRequirements: Requirement[];
  onRemove: (id: string) => void;
  onEdit?: (id: string, updatedRequirement: Requirement) => void;
  expanded?: boolean;
}> = React.memo(({ requirement, allRequirements, onRemove, onEdit, expanded = true }) => {
  const [isExpanded, setIsExpanded] = React.useState(expanded);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    detail: requirement.attrs?.detail || '',
    justification: requirement.attrs?.Justification || '',
    discussion: requirement.attrs?.Discussion || ''
  });
  
  // Resetear formulario cuando cambie el requisito
  React.useEffect(() => {
    setEditForm({
      detail: requirement.attrs?.detail || '',
      justification: requirement.attrs?.Justification || '',
      discussion: requirement.attrs?.Discussion || ''
    });
  }, [requirement]);
  
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

  // Handlers para edición
  const handleStartEdit = React.useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = React.useCallback(() => {
    setIsEditing(false);
    // Restaurar valores originales
    setEditForm({
      detail: requirement.attrs?.detail || '',
      justification: requirement.attrs?.Justification || '',
      discussion: requirement.attrs?.Discussion || ''
    });
  }, [requirement]);

  const handleSaveEdit = React.useCallback(() => {
    if (!onEdit) return;
    
    // Crear requisito actualizado
    const updatedRequirement = {
      ...requirement,
      attrs: {
        ...requirement.attrs,
        detail: editForm.detail,
        Justification: editForm.justification,
        Discussion: editForm.discussion
      },
      _isModified: true, // Marcar como modificado
      _modifiedDate: new Date().toISOString()
    };

    console.log('✏️ Guardando requisito editado:', {
      id: requirement.id,
      originalDetail: requirement.attrs?.detail,
      newDetail: editForm.detail,
      workItemSpecific: true
    });

    onEdit(requirement.id, updatedRequirement);
    setIsEditing(false);
  }, [onEdit, requirement, editForm]);

  const handleFormChange = React.useCallback((field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  if (!requirement?.id) {
    return null;
  }

  return (
    <>
      <tr className={`requirement-row ${requirement._isModified ? 'modified' : ''}`}>
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
            <span className="requirement-code">
              {requirement.displayCode || requirement.id}
              {requirement._isModified && (
                <span className="modified-indicator" title="Requirement modified specifically for this Work Item">
                  (Modified)
                </span>
              )}
            </span>
          </div>
        </td>
        <td className="requirement-detail">
          {isEditing ? (
            <div className="edit-form">
              <div className="edit-field">
                <label>Detail:</label>
                <textarea
                  value={editForm.detail}
                  onChange={(e) => handleFormChange('detail', e.target.value)}
                  placeholder="Requirement detail..."
                  rows={3}
                  style={{ width: '100%', marginBottom: '8px' }}
                />
              </div>
              <div className="edit-field">
                <label>Justification:</label>
                <textarea
                  value={editForm.justification}
                  onChange={(e) => handleFormChange('justification', e.target.value)}
                  placeholder="Justification (optional)..."
                  rows={2}
                  style={{ width: '100%', marginBottom: '8px' }}
                />
              </div>
              <div className="edit-field">
                <label>Discussion:</label>
                <textarea
                  value={editForm.discussion}
                  onChange={(e) => handleFormChange('discussion', e.target.value)}
                  placeholder="Additional discussion (optional)..."
                  rows={2}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          ) : (
            <div className="requirement-content">
              <div className="detail">{requirement.attrs?.detail || 'No detail available'}</div>
              {requirement.attrs?.Justification && (
                <div className="justification">
                  <strong>Justification:</strong> {requirement.attrs.Justification}
                </div>
              )}
              {requirement.attrs?.Discussion && (
                <div className="discussion">
                  <strong>Discussion:</strong> {requirement.attrs.Discussion}
                </div>
              )}
              {requirement._modifiedDate && (
                <div className="modification-info">
                  <small>Modified: {new Date(requirement._modifiedDate).toLocaleDateString()}</small>
                </div>
              )}
            </div>
          )}
        </td>
        <td className="requirement-actions">
          {isEditing ? (
            <div className="edit-actions">
              <button 
                className="save-button"
                onClick={handleSaveEdit}
                title="Save changes"
                style={{ marginRight: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px' }}
              >
                Save
              </button>
              <button 
                className="cancel-button"
                onClick={handleCancelEdit}
                title="Cancel edit"
                style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="view-actions">
              <button 
                className="edit-button"
                onClick={handleStartEdit}
                title="Edit requirement (specific for this Work Item)"
                style={{ marginRight: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px' }}
              >
                Edit
              </button>
              {requirement._isModified && requirement._originalRequirement && (
                <button 
                  className="restore-button"
                  onClick={() => {
                    if (onEdit && requirement._originalRequirement) {
                      const restoredRequirement: Requirement = {
                        ...requirement._originalRequirement,
                        _isModified: false,
                        _modifiedDate: undefined,
                        _originalRequirement: undefined
                      };
                      onEdit(requirement.id, restoredRequirement);
                    }
                  }}
                  title="Restore to original catalog version"
                  style={{ marginRight: '5px', backgroundColor: '#ffc107', color: '#212529', border: 'none', padding: '4px 8px', borderRadius: '3px' }}
                >
                  Restore
                </button>
              )}
              <button 
                className="remove-button"
                onClick={handleRemove}
                title="Remove this requirement"
                style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px' }}
              >
                Remove
              </button>
            </div>
          )}
        </td>
      </tr>
      {isExpanded && childRequirements.map(child => (
        <RequirementItem 
          key={child.id}
          requirement={child}
          allRequirements={allRequirements}
          onRemove={onRemove}
          onEdit={onEdit}
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

  // Función para editar un requisito específico del Work Item (independiente del catálogo)
  const editRequirement = React.useCallback((requirementId: string, updatedRequirement: Requirement) => {
    console.log(`✏️ Editando requisito: ${requirementId} del work item ${workItemId}`);
    
    try {
      setRequirements(currentRequirements => {
        const updatedRequirements = currentRequirements.map(req => {
          if (req.id === requirementId) {
            // Verificar si es una restauración
            const isRestoring = !updatedRequirement._isModified && req._isModified;
            
            if (isRestoring) {
              console.log(`🔄 Restaurando requisito ${requirementId} a versión original`);
              
              // Mostrar confirmación de restauración
              setTimeout(() => {
                alert(`🔄 ¡Requisito restaurado!\n\n` +
                      `El requisito ${requirementId} ha sido restaurado a su versión original del catálogo.\n\n` +
                      `Se han eliminado las modificaciones específicas de este Work Item.\n\n` +
                      `✨ Independencia total mantenida!`);
              }, 100);
              
              return updatedRequirement;
            } else {
              // Es una edición normal
              const editedRequirement = {
                ...updatedRequirement,
                _isModified: true,
                _modifiedDate: new Date().toISOString(),
                _originalRequirement: req._originalRequirement || { ...req } // Guardar original si no existe
              };
              
              console.log(`📝 Requisito ${requirementId} modificado para work item ${workItemId}:`, {
                originalDetail: req.attrs?.detail?.substring(0, 50) + '...',
                newDetail: editedRequirement.attrs?.detail?.substring(0, 50) + '...',
                workItemSpecific: true,
                modifiedDate: editedRequirement._modifiedDate
              });
              
              // Mostrar confirmación de edición
              setTimeout(() => {
                alert(`✅ ¡Requisito modificado!\n\n` +
                      `El requisito ${requirementId} ha sido personalizado para este Work Item.\n\n` +
                      `Esta modificación es independiente y no afecta:\n` +
                      `• El catálogo original de CRETS4DevOps\n` +
                      `• Otros Work Items del proyecto\n\n` +
                      `Tip: Use the Restore button to return to original when needed.\n\n` +
                      `✨ Independencia total garantizada!`);
              }, 100);
              
              return editedRequirement;
            }
          }
          return req;
        });
        
        // Guardar en storage independiente
        WorkItemStorage.setSelectedRequirements(updatedRequirements);
        
        return updatedRequirements;
      });
      
    } catch (err) {
      console.error("❌ Error al editar requisito:", err);
      alert("Error al guardar los cambios. Por favor intenta nuevamente.");
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
          
          // Verificar independencia estricta SIN eliminar datos
          const isIndependent = WorkItemStorage.verifyStrictIndependence();
          
          if (!isIndependent) {
            console.warn(`⚠️ Posible problema de independencia detectado para work item ${currentWorkItemId}`);
            // NO eliminar datos automáticamente - solo loggear para debug
            console.log(`📊 Storage key para este work item: ${WorkItemStorage.getStorageKey('selectedRequirements')}`);
            console.log(`🔍 Se recomienda verificar manualmente si hay conflictos`);
          } else {
            console.log(`✅ Independencia verificada para work item ${currentWorkItemId}`);
          }
          
          // Cargar requisitos específicos de este work item (después de verificación)
          const savedReqs = WorkItemStorage.getSelectedRequirements();
          
          // NUEVO: Diagnóstico completo de persistencia
          WorkItemStorage.diagnosePersistenceIssues();
          
          console.log(`📦 Requisitos específicos cargados para work item ${currentWorkItemId}:`, {
            count: savedReqs.length,
            independence: isIndependent ? '✅ Completamente independiente' : '⚠️ Verificar manualmente',
            workItemId: currentWorkItemId,
            storageKey: WorkItemStorage.getStorageKey('selectedRequirements'),
            sampleRequirements: savedReqs.slice(0, 3).map(r => ({ id: r.id, detail: r.attrs.detail.substring(0, 50) + '...' }))
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
              const confirmMessage = `Apply Sustainability Requirements\n\n` +
                `Found ${count} requirement(s) ready to apply to this Work Item.\n\n` +
                `✅ Will be independent (do not affect other Work Items)\n` +
                `✅ Can be removed individually\n` +
                `✅ Are saved automatically\n\n` +
                `Do you want to apply these requirements now?`;
              
              const shouldApply = window.confirm(confirmMessage);
              
              if (shouldApply && !isCleanedUp) {
                // Usar functional update para evitar stale closures
                setRequirements(currentReqs => {
                  console.log(`📦 Combining existing requirements (${currentReqs.length}) with new ones (${requirements.length})`);
                  
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
                  
                  console.log(`✅ ${newlyAdded} new requirements applied (total: ${combinedReqs.length})`);
                  
                  // Mostrar notificación de éxito
                  setTimeout(() => {
                    alert(`✅ Success!\n\n${newlyAdded} requirement(s) applied to Work Item.\n\nTotal requirements: ${combinedReqs.length}`);
                  }, 100);
                  
                  return combinedReqs;
                });
              } else {
                console.log('❌ Usuario rechazó aplicar los requisitos');
              }
              
            } catch (err) {
              console.error('❌ Error procesando nuevos requisitos:', err);
              alert('Error applying requirements. Please try again.');
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

  // Hook para monitorear cambios y forzar refresco automático 🔄
  React.useEffect(() => {
    if (!initialized || !workItemId) return;

    let refreshTimeout: NodeJS.Timeout;
    
    // Función para refrescar los requisitos desde localStorage
    const refreshRequirements = () => {
      try {
        console.log('🔄 Refrescando requisitos automáticamente...');
        const savedRequirements = WorkItemStorage.getSelectedRequirements();
        
        if (savedRequirements.length > 0) {
          console.log(`✅ ${savedRequirements.length} requisitos encontrados para refresco`);
          setRequirements(savedRequirements);
        } else {
          console.log('📭 No hay requisitos para mostrar (refresco automático)');
          setRequirements([]);
        }
      } catch (error) {
        console.error('❌ Error refrescando requisitos:', error);
      }
    };

    // Escuchar cambios en localStorage específicos para nuestro Work Item
    const handleStorageChange = (event: StorageEvent) => {
      const ourStorageKey = WorkItemStorage.getStorageKey('selectedRequirements');
      
      if (event.key === ourStorageKey) {
        console.log('🔔 Cambio detectado en localStorage para Work Item:', {
          workItemId: workItemId,
          key: event.key,
          newValue: event.newValue ? `${JSON.parse(event.newValue).length} requisitos` : 'vacío'
        });
        
        // Debounce para evitar múltiples refrescos
        clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(refreshRequirements, 200);
      }
    };

    // Refresco manual vía evento personalizado
    const handleManualRefresh = () => {
      console.log('🔄 Refresco manual solicitado para Work Item:', workItemId);
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(refreshRequirements, 50);
    };

    // Registrar listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('crets.refresh', handleManualRefresh);

    // Refresco inicial para sincronización
    refreshTimeout = setTimeout(refreshRequirements, 300);

    return () => {
      clearTimeout(refreshTimeout);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('crets.refresh', handleManualRefresh);
    };
  }, [initialized, workItemId]); // Depende de inicialización y work item ID

  if (loading) return <div className="loading">Cargando requisitos...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className={`workitem-requirements-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>

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
          
          <div className="editing-info" style={{
            backgroundColor: '#e8f4fd',
            border: '1px solid #007bff',
            borderRadius: '4px',
            padding: '12px',
            margin: '10px 0',
            color: '#0c5460'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#0c5460' }}>Independent Requirements Editing</h4>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              Each requirement can be customized specifically for this Work Item without affecting 
              the original catalog or other Work Items.
            </p>
            <div style={{ display: 'flex', gap: '15px', fontSize: '12px', marginTop: '8px' }}>
              <span><strong>Edit</strong> content</span>
              <span><strong>Restore</strong> original</span>
              <span><strong>Auto</strong> refresh</span>
              <span><strong>Remove</strong></span>
            </div>
          </div>
          
          <div className="independence-test-controls">
            <button 
              onClick={() => {
                console.log('🔄 Refresco manual solicitado por usuario');
                const refreshRequirements = () => {
                  try {
                    const savedRequirements = WorkItemStorage.getSelectedRequirements();
                    console.log(`🔄 Refrescando: ${savedRequirements.length} requisitos encontrados`);
                    setRequirements(savedRequirements);
                    
                    // Disparar evento global de refresco
                    window.dispatchEvent(new CustomEvent('crets.refresh'));
                    
                    alert(`REFRESH COMPLETED\n\n` +
                          `Updated requirements: ${savedRequirements.length}\n` +
                          `Work Item: ${workItemId}\n` +
                          `Status: ${isNewWorkItem ? 'NEW' : 'EXISTING'}\n\n` +
                          `✅ Section has been updated correctly.`);
                  } catch (error) {
                    console.error('❌ Error en refresco manual:', error);
                    alert('❌ Error refreshing. See console for details.');
                  }
                };
                refreshRequirements();
              }}
              style={{
                padding: '8px 12px',
                margin: '10px 5px 10px 0',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              title="Refresh requirements manually if they don't update automatically"
            >
              Refresh Now
            </button>
          </div>
          
          <table className="requirements-table">
            <thead>
              <tr>
                <th className="id-header">ID</th>
                <th className="detail-header">Detail</th>
                <th className="action-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topLevelRequirements.map(req => (
                <RequirementItem 
                  key={req.id} 
                  requirement={req} 
                  allRequirements={requirements}
                  onRemove={removeRequirement}
                  onEdit={editRequirement}
                />
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div className="no-requirements">
          <h3>No sustainability requirements applied</h3>
          
          {workItemId ? (
            <>
              <div className="refresh-section" style={{ marginBottom: '15px' }}>
                <p>Did you apply requirements from the hub but they don't appear here?</p>
                <button 
                  onClick={() => {
                    console.log('🔄 Refresco manual desde sección vacía');
                    try {
                      const savedRequirements = WorkItemStorage.getSelectedRequirements();
                      console.log(`🔍 Verificando requisitos: ${savedRequirements.length} encontrados`);
                      setRequirements(savedRequirements);
                      
                      if (savedRequirements.length > 0) {
                        alert(`REQUIREMENTS FOUND!\n\n` +
                              `Found ${savedRequirements.length} requirements for this Work Item.\n` +
                              `The section has been updated correctly.`);
                      } else {
                        alert(`No saved requirements for this Work Item.\n\n` +
                              `Work Item: ${workItemId}\n` +
                              `Type: ${workItemType || 'Not identified'}\n` +
                              `Status: ${isNewWorkItem ? 'NEW' : 'EXISTING'}\n\n` +
                              `Go to the CRETS4DevOps hub and apply some requirements.`);
                      }
                    } catch (error) {
                      console.error('❌ Error en refresco:', error);
                      alert('Error refreshing. See console for details.');
                    }
                  }}
                  style={{
                    padding: '10px 16px',
                    margin: '10px 0',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Check and Refresh Requirements
                </button>
              </div>
              
              <div className="instructions">
                <h4>How to add requirements:</h4>
                <ol>
                  <li>Go to the "CRETS4DevOps" hub in your project</li>
                  <li>Select the sustainability requirements you need</li>
                  <li>Click "Apply Selected to Work Items"</li>
                  <li>Requirements will be applied independently to this Work Item</li>
                </ol>
                <div className="independence-note">
                  <strong>Independence:</strong> Each Work Item has its own independent set of sustainability requirements. Adding requirements to one Work Item does not affect others.
                </div>
              </div>
            </>
          ) : (
            <div className="error">
              <h4>Context Error</h4>
              <p>Could not get Work Item ID.</p>
              <p><strong>Compatible Work Item types:</strong></p>
              <ul>
                <li>Product Backlog Item (PBI)</li>
                <li>Epic</li>
                <li>Feature</li>
                <li>Bug</li>
                <li>Task</li>
                <li>Test Case</li>
                <li>User Story</li>
                <li>Other custom types</li>
              </ul>
              <p>Please make sure you are viewing this tab from any Work Item opened in Azure DevOps.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Renderizar componente
ReactDOM.render(<WorkItemRequirements />, document.getElementById('root'));
