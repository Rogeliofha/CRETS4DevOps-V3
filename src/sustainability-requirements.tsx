import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as SDK from 'azure-devops-extension-sdk';
import './sustainability-requirements.css';

// Interfaz para los requisitos de sostenibilidad
interface Requirement {
  id: string;
  displayCode: string;
  parentId: string;
  children: string[];
  level: number;
  title: string | null;
  description: string | null;
  tags: string | null;
  dimension: string | null;
  attrs: {
    Id: string;
    detail: string;
    Justification?: string;
    Discussion?: string;
  };
  _meta: {
    source_file: string;
    identifier_column: string;
  };
  hasParentInDataset: boolean;
  // Añadimos un índice de tipo string para permitir acceso dinámico a las propiedades
  [key: string]: any;
}

// Componente para mostrar un requisito individual
const RequirementItem: React.FC<{
  requirement: Requirement;
  requirements: Requirement[];
  selectedRequirement: Requirement | null;
  onSelect: (req: Requirement) => void;
  onEdit: (req: Requirement) => void;
  onDelete: (req: Requirement) => void;
  level: number;
  isChecked: boolean;
  onCheckChange: (req: Requirement, checked: boolean) => void;
  checkedRequirements: string[]; // Agregar prop para tener acceso a todos los requisitos seleccionados
}> = ({ requirement, requirements, selectedRequirement, onSelect, onEdit, onDelete, level, isChecked, onCheckChange, checkedRequirements }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Verificar que requirement y sus propiedades existan
  if (!requirement || !requirement.id || !requirement.children) {
    console.warn('Requisito inválido', requirement);
    return null;
  }
  
  // Filtrar requisitos hijos, verificando que requirement.children exista
  const childRequirements = requirements.filter(req => 
    req && requirement.children && Array.isArray(requirement.children) && 
    requirement.children.includes(req.id)
  );

  // Auto-expandir si alguno de los hijos está seleccionado
  React.useEffect(() => {
    if (childRequirements.some(child => checkedRequirements.includes(child.id))) {
      setIsExpanded(true);
    }
  }, [checkedRequirements, childRequirements]);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onCheckChange(requirement, e.target.checked);
  };

  const isSelected = selectedRequirement && selectedRequirement.id === requirement.id;
  
  // Asegurarse de que los atributos existen
  const displayCode = requirement.displayCode || '';
  const detail = requirement.attrs && requirement.attrs.detail ? requirement.attrs.detail : '';

  return (
    <div className="requirement-container">
      <div 
        className={`requirement-item ${isSelected ? 'selected' : ''}`} 
        style={{ marginLeft: `${level * 20}px` }}
        onClick={() => onSelect(requirement)}
      >
        <div className="requirement-header">
          <input 
            type="checkbox" 
            className="requirement-checkbox"
            checked={isChecked}
            onChange={handleCheckChange}
            onClick={(e) => e.stopPropagation()}
          />
          {childRequirements.length > 0 && (
            <button className="toggle-button" onClick={handleToggleExpand}>
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          <span className="requirement-code">{displayCode}</span>
          <span className="requirement-detail">{detail}</span>
        </div>
        <div className="requirement-actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit(requirement); }}>Edit</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(requirement); }}>Remove</button>
        </div>
      </div>
      {isExpanded && childRequirements.length > 0 && (
        <div className="children-container">
          {childRequirements.map(child => (
            <RequirementItem 
              key={child.id} 
              requirement={child} 
              requirements={requirements}
              selectedRequirement={selectedRequirement}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
              // Permitir que cada hijo tenga su propio estado de check independiente
              isChecked={checkedRequirements.includes(child.id)}
              onCheckChange={onCheckChange}
              checkedRequirements={checkedRequirements}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente para editar un requisito
const RequirementEditForm: React.FC<{
  requirement: Requirement | null;
  onSave: (updatedReq: Requirement) => void;
  onCancel: () => void;
}> = ({ requirement, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState<Requirement | null>(null);

  React.useEffect(() => {
    if (requirement) {
      setFormData({...requirement});
    }
  }, [requirement]);

  if (!formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    console.log(`Edit form field changed: ${name} = ${value}`);
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        if (!prev) return null;
        
        // Crear una copia profunda para evitar mutaciones
        const updatedFormData = {...prev};
        if (!updatedFormData[parent]) {
          updatedFormData[parent] = {};
        }
        
        // Manejar específicamente el caso de attrs
        if (parent === 'attrs') {
          updatedFormData.attrs = {...updatedFormData.attrs, [child]: value};
        } else {
          // Para otros objetos anidados
          const parentObj = {...updatedFormData[parent]};
          parentObj[child] = value;
          updatedFormData[parent] = parentObj;
        }
        
        console.log('Updated edit form data:', updatedFormData);
        return updatedFormData;
      });
    } else {
      setFormData(prev => {
        if (!prev) return null;
        const updated = {...prev, [name]: value};
        console.log('Updated edit form data:', updated);
        return updated;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Edit form submitted with data:', formData);
    
    if (formData) {
      console.log('Calling onSave with updated requirement:', formData);
      onSave(formData);
    } else {
      console.error('Form data is null, cannot save');
    }
  };

  return (
    <div className="edit-form-container">
      <h2>Edit Requirement</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="displayCode">Code</label>
          <input
            type="text"
            id="displayCode"
            name="displayCode"
            value={formData.displayCode}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="attrs.detail">Detail</label>
          <textarea
            id="attrs.detail"
            name="attrs.detail"
            value={formData.attrs.detail}
            onChange={handleChange}
            rows={5}
          />
        </div>
        {formData.attrs.Justification && (
          <div className="form-group">
            <label htmlFor="attrs.Justification">Justification</label>
            <textarea
              id="attrs.Justification"
              name="attrs.Justification"
              value={formData.attrs.Justification}
              onChange={handleChange}
              rows={3}
            />
          </div>
        )}
        {formData.attrs.Discussion && (
          <div className="form-group">
            <label htmlFor="attrs.Discussion">Discussion</label>
            <textarea
              id="attrs.Discussion"
              name="attrs.Discussion"
              value={formData.attrs.Discussion}
              onChange={handleChange}
              rows={3}
            />
          </div>
        )}
        <div className="form-buttons">
          <button type="submit" className="save-button">Save</button>
          <button type="button" className="cancel-button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

// Componente principal para la gestión de requisitos
// Componente para crear un nuevo requisito
const RequirementCreateForm: React.FC<{
  requirements: Requirement[];
  onSave: (newReq: Requirement) => void;
  onCancel: () => void;
}> = ({ requirements, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState<{
    displayCode: string;
    parentId: string;
    detail: string;
    justification?: string;
    discussion?: string;
  }>({
    displayCode: '',
    parentId: '',
    detail: '',
    justification: '',
    discussion: ''
  });
  const [error, setError] = React.useState<string | null>(null);

  // Extraer prefijos únicos para el selector de padres
  const extractPrefixes = () => {
    const prefixes = new Set<string>();
    requirements.forEach(req => {
      // Extraer el prefijo (ej. "Mod", "Esc", "Fia")
      const match = req.id.match(/^([A-Za-z]+)\./);
      if (match && match[1]) {
        prefixes.add(match[1]);
      }
    });
    return Array.from(prefixes);
  };

  const prefixes = extractPrefixes();

  // Obtener posibles padres basados en el código ingresado
  const getPotentialParents = () => {
    if (!formData.displayCode) return [];
    
    // Normalizar el código ingresado
    const normalizedCode = formData.displayCode.replace(/\.$/, '');
    
    // Determinar el nivel de jerarquía
    const segments = normalizedCode.split('.');
    if (segments.length <= 1) return []; // Es un nodo raíz
    
    // Construir el ID del padre potencial
    const parentSegments = segments.slice(0, -1);
    const parentId = parentSegments.join('.');
    
    // Filtrar requisitos que podrían ser padres
    return requirements.filter(req => {
      const reqNormalizedId = req.id.replace(/\.$/, '');
      return reqNormalizedId === parentId;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    console.log(`Field changed: ${name} = ${value}`);
    
    // Actualizar el estado del formulario
    setFormData(prev => {
      const newData = {...prev, [name]: value};
      
      // Si es el código, intentar determinar el padre automáticamente
      if (name === 'displayCode') {
        // Calcular el padre potencial basado en el nuevo código
        const normalizedCode = value.replace(/\.$/, '');
        const segments = normalizedCode.split('.');
        
        if (segments.length > 1) {
          const parentSegments = segments.slice(0, -1);
          const parentId = parentSegments.join('.');
          
          // Buscar el padre en los requisitos existentes
          const potentialParent = requirements.find(req => {
            const reqNormalizedId = req.id.replace(/\.$/, '');
            return reqNormalizedId === parentId;
          });
          
          if (potentialParent) {
            newData.parentId = potentialParent.id;
            console.log(`Auto-selected parent: ${potentialParent.id}`);
          }
        }
      }
      
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  const validateForm = (): boolean => {
    console.log('Validating form with data:', formData);
    
    if (!formData.displayCode.trim()) {
      setError('Code is required');
      console.log('Validation failed: Code is required');
      return false;
    }
    if (!formData.detail.trim()) {
      setError('Detail is required');
      console.log('Validation failed: Detail is required');
      return false;
    }
    
    // Validar que el código siga el formato correcto (ej. "Mod.1.", "Mod.1.1.")
    const codePattern = /^[A-Za-z]+\.\d+(\.\d+)*\.?$/;
    if (!codePattern.test(formData.displayCode)) {
      setError('Code must follow the correct format (e.g. "Mod.1.", "Mod.1.1.")');
      console.log('Validation failed: Invalid code format');
      return false;
    }
    
    // Validar que no exista un requisito con el mismo código
    const normalizedCode = formData.displayCode.replace(/\.$/, '');
    const existingReq = requirements.find(req => 
      req.id === normalizedCode || 
      req.displayCode === formData.displayCode ||
      req.id.replace(/\.$/, '') === normalizedCode
    );
    
    if (existingReq) {
      setError('A requirement with this code already exists');
      console.log('Validation failed: Duplicate code', existingReq);
      return false;
    }
    
    console.log('Form validation passed successfully');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    console.log('Form validation passed, creating requirement...');
    
    // Normalizar el código para el ID
    const normalizedCode = formData.displayCode.replace(/\.$/, '');
    
    // Determinar el nivel jerárquico
    const level = normalizedCode.split('.').length + 1;
    
    // Crear el nuevo requisito
    const newRequirement: Requirement = {
      id: normalizedCode,
      displayCode: formData.displayCode,
      parentId: formData.parentId,
      children: [],
      level,
      title: null,
      description: null,
      tags: null,
      dimension: null,
      attrs: {
        Id: formData.displayCode,
        detail: formData.detail,
        ...(formData.justification ? { Justification: formData.justification } : {}),
        ...(formData.discussion ? { Discussion: formData.discussion } : {})
      },
      _meta: {
        source_file: "Nuevos requisitos",
        identifier_column: "Id"
      },
      hasParentInDataset: !!formData.parentId
    };
    
    console.log('Creating new requirement:', newRequirement);
    onSave(newRequirement);
    
    // Limpiar el formulario después del envío exitoso
    setFormData({
      displayCode: '',
      parentId: '',
      detail: '',
      justification: '',
      discussion: ''
    });
    setError(null);
  };

  // Generar lista de posibles padres basada en la jerarquía
  const parentOptions = React.useMemo(() => {
    return requirements.map(req => ({
      id: req.id,
      displayCode: req.displayCode,
      detail: req.attrs.detail
    }));
  }, [requirements]);

  return (
    <div className="create-form-container">
      <h2>Create New Requirement</h2>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="displayCode">Code *</label>
          <input
            type="text"
            id="displayCode"
            name="displayCode"
            placeholder="Ex: Mod.5.1."
            value={formData.displayCode}
            onChange={handleChange}
            required
          />
          <small>Format: Prefix.Number[.Subnumber] (Ex: Mod.5.1.)</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="parentId">Parent Requirement</label>
          <select
            id="parentId"
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
          >
            <option value="">-- Select Parent --</option>
            {parentOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.displayCode} - {option.detail.substring(0, 50)}...
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="detail">Detail *</label>
          <textarea
            id="detail"
            name="detail"
            value={formData.detail}
            onChange={handleChange}
            rows={5}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="justification">Justification (optional)</label>
          <textarea
            id="justification"
            name="justification"
            value={formData.justification}
            onChange={handleChange}
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="discussion">Discussion (optional)</label>
          <textarea
            id="discussion"
            name="discussion"
            value={formData.discussion}
            onChange={handleChange}
            rows={3}
          />
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="save-button">Create Requirement</button>
          <button type="button" className="cancel-button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const SustainabilityRequirements: React.FC = () => {
  const [requirements, setRequirements] = React.useState<Requirement[]>([]);
  const [selectedRequirement, setSelectedRequirement] = React.useState<Requirement | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [checkedRequirements, setCheckedRequirements] = React.useState<string[]>([]);
  const [showSelectedPanel, setShowSelectedPanel] = React.useState(false);

  // Cargar los requisitos al iniciar
  React.useEffect(() => {
    const loadRequirements = async () => {
      try {
        setLoading(true);
        console.log('Intentando cargar los requisitos de sostenibilidad...');
        
        // PASO 1: Verificar si hay datos guardados en localStorage
        let loadedRequirements: Requirement[] = [];
        
        try {
          const savedRequirements = localStorage.getItem('sustainabilityRequirements');
          if (savedRequirements) {
            const parsedRequirements = JSON.parse(savedRequirements);
            if (Array.isArray(parsedRequirements) && parsedRequirements.length > 0) {
              console.log('Datos cargados desde localStorage:', parsedRequirements.length, 'requisitos');
              loadedRequirements = parsedRequirements;
              setRequirements(loadedRequirements);
              return; // Si hay datos en localStorage, úsalos y sal
            }
          }
        } catch (e) {
          console.warn('Error cargando datos de localStorage:', e);
        }
        
        // PASO 2: Si no hay datos en localStorage, cargar datos por defecto
        console.log('No hay datos en localStorage, cargando datos por defecto...');
        
        // Datos completos para mostrar en la interfaz
        const fullSampleData = [
          {
            "id": "Mod.1",
            "displayCode": "Mod.1.",
            "parentId": "Mod",
            "children": ["Mod.1.1", "Mod.1.2", "Mod.1.3", "Mod.1.4"],
            "level": 2,
            "title": null,
            "description": null,
            "tags": null,
            "dimension": null,
            "attrs": {
              "Id": "Mod.1.",
              "detail": "Compatibilidad y Conectividad",
              "Justification": "Los sistemas interoperables reducen las necesidades de rediseño y migración de datos."
            },
            "_meta": {
              "source_file": "Requisitos de sostenibilidad.csv",
              "identifier_column": "Id"
            },
            "hasParentInDataset": false
          },
          {
            "id": "Mod.1.1",
            "displayCode": "Mod.1.1.",
            "parentId": "Mod.1",
            "children": [],
            "level": 3,
            "title": null,
            "description": null,
            "tags": null,
            "dimension": null,
            "attrs": {
              "Id": "Mod.1.1.",
              "detail": "El software debe utilizar APIs estandarizadas",
              "Justification": "Facilita la integración con otros sistemas y reduce la necesidad de adaptadores específicos."
            },
            "_meta": {
              "source_file": "Requisitos de sostenibilidad.csv",
              "identifier_column": "Id"
            },
            "hasParentInDataset": true
          },
          {
            "id": "Mod.1.2",
            "displayCode": "Mod.1.2.",
            "parentId": "Mod.1",
            "children": [],
            "level": 3,
            "title": null,
            "description": null,
            "tags": null,
            "dimension": null,
            "attrs": {
              "Id": "Mod.1.2.",
              "detail": "Se deben utilizar formatos de datos comunes y ampliamente aceptados (JSON, XML, CSV)",
              "Justification": "Reduce la necesidad de conversiones y facilita la portabilidad de datos."
            },
            "_meta": {
              "source_file": "Requisitos de sostenibilidad.csv",
              "identifier_column": "Id"
            },
            "hasParentInDataset": true
          },
          {
            "id": "Mod.1.3",
            "displayCode": "Mod.1.3.",
            "parentId": "Mod.1",
            "children": [],
            "level": 3,
            "title": null,
            "description": null,
            "tags": null,
            "dimension": null,
            "attrs": {
              "Id": "Mod.1.3.",
              "detail": "El software debe ser compatible con versiones anteriores cuando sea posible",
              "Justification": "Evita la obsolescencia prematura y extiende la vida útil de las soluciones implementadas."
            },
            "_meta": {
              "source_file": "Requisitos de sostenibilidad.csv",
              "identifier_column": "Id"
            },
            "hasParentInDataset": true
          },
          {
            "id": "Mod.1.4",
            "displayCode": "Mod.1.4.",
            "parentId": "Mod.1",
            "children": [],
            "level": 3,
            "title": null,
            "description": null,
            "tags": null,
            "dimension": null,
            "attrs": {
              "Id": "Mod.1.4.",
              "detail": "Implementar mecanismos de versionado para APIs y formatos de datos",
              "Justification": "Permite la evolución controlada manteniendo la compatibilidad con clientes existentes."
            },
            "_meta": {
              "source_file": "Requisitos de sostenibilidad.csv",
              "identifier_column": "Id"
            },
            "hasParentInDataset": true
          },
          {
            "id": "Opt.1",
            "displayCode": "Opt.1.",
            "parentId": "Opt",
            "children": ["Opt.1.1", "Opt.1.2"],
            "level": 2,
            "title": null,
            "description": null,
            "tags": null,
            "dimension": null,
            "attrs": {
              "Id": "Opt.1.",
              "detail": "Optimización de Recursos",
              "Justification": "La eficiencia en el uso de recursos reduce el impacto ambiental y los costes operativos."
            },
            "_meta": {
              "source_file": "Requisitos de sostenibilidad.csv",
              "identifier_column": "Id"
            },
            "hasParentInDataset": false
          },
          {
            "id": "Opt.1.1",
            "displayCode": "Opt.1.1.",
            "parentId": "Opt.1",
            "children": [],
            "level": 3,
            "title": null,
            "description": null,
            "tags": null,
            "dimension": null,
            "attrs": {
              "Id": "Opt.1.1.",
              "detail": "El software debe minimizar el consumo de CPU, memoria y almacenamiento",
              "Justification": "Reduce los requisitos de hardware y la huella energética."
            },
            "_meta": {
              "source_file": "Requisitos de sostenibilidad.csv",
              "identifier_column": "Id"
            },
            "hasParentInDataset": true
          },
          {
            "id": "Opt.1.2",
            "displayCode": "Opt.1.2.",
            "parentId": "Opt.1",
            "children": [],
            "level": 3,
            "title": null,
            "description": null,
            "tags": null,
            "dimension": null,
            "attrs": {
              "Id": "Opt.1.2.",
              "detail": "Implementar mecanismos de caché para reducir procesamiento redundante",
              "Discussion": "Los sistemas de caché deben ser configurables para adaptarse a diferentes escenarios."
            },
            "_meta": {
              "source_file": "Requisitos de sostenibilidad.csv",
              "identifier_column": "Id"
            },
            "hasParentInDataset": true
          }
        ];

        // Usar los datos completos directamente
        console.log('Cargando datos de requisitos de sostenibilidad');
        setRequirements(fullSampleData);
        
        // Guardar los datos por defecto en localStorage para futuros usos
        try {
          localStorage.setItem('sustainabilityRequirements', JSON.stringify(fullSampleData));
          console.log('Datos por defecto guardados en localStorage');
        } catch (e) {
          console.warn('Error guardando datos por defecto en localStorage:', e);
        }
        
        // También intentamos cargar desde el archivo pero no bloqueamos la interfaz
        try {
          const response = await fetch('./sustainability_requirements.json');
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              console.log('Datos cargados del archivo:', data.length, 'requisitos');
              setRequirements(data);
              // Guardar los datos del archivo en localStorage
              try {
                localStorage.setItem('sustainabilityRequirements', JSON.stringify(data));
                console.log('Datos del archivo guardados en localStorage');
              } catch (e) {
                console.warn('Error guardando datos del archivo en localStorage:', e);
              }
            }
          }
        } catch (e) {
          console.warn('No se pudo cargar el archivo JSON, usando datos de muestra', e);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar los datos');
        console.error('Error cargando requisitos:', err);
      } finally {
        setLoading(false);
      }
    };

    // Inicializar el SDK de Azure DevOps
    SDK.init().then(() => {
      loadRequirements();
    }).catch(error => {
      console.error('Error inicializando SDK de Azure DevOps:', error);
      setError('Error inicializando SDK de Azure DevOps');
      setLoading(false);
    });
  }, []);

  // Filtrar los requisitos de nivel superior (sin padre en el conjunto de datos)
  const topLevelRequirements = requirements.filter(req => 
    req && (!req.hasParentInDataset || !requirements.some(r => r && r.id === req.parentId))
  );

  // Filtrar requisitos por término de búsqueda
  const filteredRequirements = searchTerm.trim() === '' 
    ? requirements 
    : requirements.filter(req => {
        if (!req || !req.displayCode || !req.attrs || !req.attrs.detail) return false;
        return (
          req.displayCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.attrs.detail.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });

  const handleSelectRequirement = (req: Requirement) => {
    setSelectedRequirement(req);
  };

  const handleEditRequirement = (req: Requirement) => {
    setSelectedRequirement(req);
    setIsEditing(true);
  };

  const handleSaveRequirement = (updatedReq: Requirement) => {
    console.log('Saving updated requirement:', updatedReq);
    
    const updatedRequirements = requirements.map(req => 
      req.id === updatedReq.id ? updatedReq : req
    );
    
    setRequirements(updatedRequirements);
    setSelectedRequirement(updatedReq);
    setIsEditing(false);

    // Guardar en localStorage para persistencia
    try {
      localStorage.setItem('sustainabilityRequirements', JSON.stringify(updatedRequirements));
      console.log('Updated requirements saved to localStorage');
    } catch (error) {
      console.error('Error saving updated requirements to localStorage:', error);
    }

    console.log('Requirement updated successfully:', updatedReq);
  };

  const handleDeleteRequirement = (reqToDelete: Requirement) => {
    console.log('Attempting to delete requirement:', reqToDelete);
    
    if (window.confirm(`Are you sure you want to delete requirement ${reqToDelete.displayCode}?`)) {
      // Filtrar el requisito a eliminar y todos sus hijos
      const idsToDelete = [reqToDelete.id, ...getChildrenIds(reqToDelete.id, requirements)];
      console.log('IDs to delete:', idsToDelete);
      
      const updatedRequirements = requirements.filter(req => !idsToDelete.includes(req.id));
      
      // Actualizar las referencias en los padres
      updatedRequirements.forEach(req => {
        if (req.children.includes(reqToDelete.id)) {
          req.children = req.children.filter(id => id !== reqToDelete.id);
        }
      });
      
      console.log('Requirements after deletion:', updatedRequirements);
      
      setRequirements(updatedRequirements);
      
      // Limpiar la selección si el requisito eliminado estaba seleccionado
      if (selectedRequirement && selectedRequirement.id === reqToDelete.id) {
        setSelectedRequirement(null);
        setIsEditing(false);
      }
      
      // Guardar en localStorage para persistencia
      try {
        localStorage.setItem('sustainabilityRequirements', JSON.stringify(updatedRequirements));
        console.log('Requirements after deletion saved to localStorage');
      } catch (error) {
        console.error('Error saving after deletion to localStorage:', error);
      }
      
      console.log('Requirement deleted successfully:', reqToDelete);
    }
  };

  const handleCreateRequirement = (newReq: Requirement) => {
    console.log('Creating new requirement:', newReq);
    
    // Verificar que newReq tiene todas las propiedades necesarias
    if (!newReq.id || !newReq.displayCode || !newReq.attrs || !newReq.attrs.detail) {
      console.error('Invalid requirement data:', newReq);
      return;
    }
    
    // Agregar el nuevo requisito a la lista
    const updatedRequirements = [...requirements, newReq];
    
    // Actualizar las referencias del padre
    if (newReq.parentId) {
      const parentIndex = updatedRequirements.findIndex(req => req.id === newReq.parentId);
      if (parentIndex >= 0) {
        const parent = updatedRequirements[parentIndex];
        updatedRequirements[parentIndex] = {
          ...parent,
          children: [...parent.children, newReq.id]
        };
        console.log(`Updated parent ${parent.id} with new child ${newReq.id}`);
      } else {
        console.warn(`Parent with ID ${newReq.parentId} not found`);
      }
    }
    
    console.log('Updated requirements list:', updatedRequirements);
    
    // Actualizar el estado
    setRequirements(updatedRequirements);
    setSelectedRequirement(newReq);
    setIsCreating(false);
    
    // Guardar en localStorage para persistencia
    try {
      localStorage.setItem('sustainabilityRequirements', JSON.stringify(updatedRequirements));
      console.log('Requirements saved to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    console.log('Requirement created successfully, closing form');
  };

  // Función auxiliar para obtener todos los IDs hijos de un requisito dado
  const getChildrenIds = (parentId: string, reqs: Requirement[]): string[] => {
    const childIds: string[] = [];
    const directChildren = reqs.filter(r => r.parentId === parentId);
    
    directChildren.forEach(child => {
      childIds.push(child.id);
      childIds.push(...getChildrenIds(child.id, reqs));
    });
    
    return childIds;
  };

  // Manejar la selección de requisitos
  const handleCheckRequirement = (req: Requirement, checked: boolean) => {
    if (checked) {
      // Si se selecciona un requisito, lo agregamos a la lista
      setCheckedRequirements(prev => [...prev, req.id]);
    } else {
      // Si se deselecciona, lo eliminamos de la lista
      setCheckedRequirements(prev => prev.filter(id => id !== req.id));
    }
  };

  // Verificar si un requisito está seleccionado
  const isRequirementChecked = (reqId: string): boolean => {
    return checkedRequirements.includes(reqId);
  };

  // Función para mostrar los requisitos seleccionados en el Work Item (mejorada)
  const saveSelectedRequirements = () => {
    if (checkedRequirements.length === 0) {
      alert('⚠️ Por favor selecciona al menos un requisito de sostenibilidad antes de aplicar.');
      return;
    }
    
    // Mostrar ventana emergente de confirmación
    const confirmMessage = `Apply Sustainability Requirements\n\n` +
      `${checkedRequirements.length} sustainability requirement(s) will be applied.\n\n` +
      `✅ Requirements will be independent per Work Item\n` +
      `✅ Will not affect other Work Items in the project\n` +
      `✅ Can be removed individually\n\n` +
      `Do you want to continue?`;
    
    if (!confirm(confirmMessage)) {
      console.log('User cancelled requirements application');
      return;
    }
    
    // Aquí aplicamos los requisitos de manera independiente
    setShowSelectedPanel(true);
    
    try {
      // Obtener los requisitos seleccionados
      const newSelectedReqs: Requirement[] = [];
      
      // Agregar solo los requisitos que han sido explícitamente seleccionados
      checkedRequirements.forEach(reqId => {
        const req = requirements.find(r => r.id === reqId);
        if (req && !newSelectedReqs.some(r => r.id === req.id)) {
          newSelectedReqs.push(req);
        }
      });
      
      console.log(`🚀 Preparing ${newSelectedReqs.length} requirements for independent application`);
      
      // Sistema de comunicación mejorado con múltiples estrategias
      const timestamp = Date.now();
      const pendingKey = `pending_requirements_${timestamp}`;
      
      // ESTRATEGIA 1: localStorage como puente principal
      try {
        localStorage.setItem(pendingKey, JSON.stringify(newSelectedReqs));
        
        // Establecer bandera de requisitos pendientes con información extendida
        const pendingData = {
          key: pendingKey,
          count: newSelectedReqs.length,
          timestamp: timestamp,
          source: 'CRETS4DevOps-Hub',
          version: '2.1.4'
        };
        
        localStorage.setItem('requirements_pending', JSON.stringify(pendingData));
        console.log('✅ Datos guardados en localStorage:', pendingData);
      } catch (storageError) {
        console.error('❌ Error en localStorage:', storageError);
        alert('Error guardando requisitos. Por favor intenta nuevamente.');
        return;
      }
      
      // ESTRATEGIA 2: Broadcast a todos los windows/frames posibles
      const broadcastMessage = {
        type: 'requirements.available',
        requirements: newSelectedReqs,
        pendingKey: pendingKey,
        count: newSelectedReqs.length,
        timestamp: timestamp,
        source: 'CRETS4DevOps-Hub'
      };
      
      // Enviar a window principal
      try {
        if (window.top && window.top !== window) {
          window.top.postMessage(broadcastMessage, '*');
          console.log('📤 Mensaje enviado a window.top');
        }
        
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(broadcastMessage, '*');
          console.log('📤 Mensaje enviado a window.parent');
        }
      } catch (e) {
        console.log('⚠️ Error enviando a parent windows:', e);
      }
      
      // Enviar a todos los child frames
      try {
        for (let i = 0; i < window.frames.length; i++) {
          try {
            window.frames[i].postMessage(broadcastMessage, '*');
            console.log(`📤 Mensaje enviado a frame[${i}]`);
          } catch (e) {
            console.log(`⚠️ No se pudo enviar a frame[${i}]:`, e);
          }
        }
      } catch (e) {
        console.log('⚠️ Error enviando a child frames:', e);
      }
      
      // ESTRATEGIA 3: Custom Event en window actual
      try {
        const customEvent = new CustomEvent('requirements.available', { 
          detail: broadcastMessage
        });
        window.dispatchEvent(customEvent);
        console.log('📤 CustomEvent disparado en window actual');
      } catch (e) {
        console.log('⚠️ Error con CustomEvent:', e);
      }
      
      // ESTRATEGIA 4: Intentar enviar a través del DOM
      try {
        // Buscar iframes específicos de work items
        const workItemFrames = document.querySelectorAll('iframe[src*="workItems"], iframe[src*="workitem"]');
        workItemFrames.forEach((iframe, index) => {
          try {
            const iframeElement = iframe as HTMLIFrameElement;
            if (iframeElement.contentWindow) {
              iframeElement.contentWindow.postMessage(broadcastMessage, '*');
              console.log(`📤 Mensaje enviado a iframe workitem[${index}]`);
            }
          } catch (e) {
            console.log(`⚠️ Error enviando a iframe workitem[${index}]:`, e);
          }
        });
      } catch (e) {
        console.log('⚠️ Error buscando iframes de work items:', e);
      }
      
      // ESTRATEGIA 5: Usar Azure DevOps SDK si está disponible
      try {
        if (typeof SDK !== 'undefined' && SDK.notifyLoadSucceeded) {
          SDK.notifyLoadSucceeded();
          console.log('📤 SDK notification enviada');
        }
      } catch (sdkErr) {
        console.log('⚠️ SDK notification no disponible:', sdkErr);
      }
      
      console.log(`🎯 Requisitos preparados con clave: ${pendingKey}`);
      console.log(`📊 Total de estrategias de comunicación ejecutadas: 5`);
      
      // ESTRATEGIA 6: Disparar evento de refresco para Work Items abiertos 🔄
      try {
        const refreshEvent = new CustomEvent('crets.refresh', { 
          detail: { 
            action: 'requirements-applied',
            count: newSelectedReqs.length,
            timestamp: timestamp
          }
        });
        window.dispatchEvent(refreshEvent);
        console.log('🔄 Evento de refresco disparado para Work Items');
        
        // También enviar a parent/child windows
        if (window.top && window.top !== window) {
          window.top.dispatchEvent(refreshEvent);
        }
        if (window.parent && window.parent !== window) {
          window.parent.dispatchEvent(refreshEvent);
        }
      } catch (e) {
        console.log('⚠️ Error disparando evento de refresco:', e);
      }
      
      // Mostrar feedback al usuario
      alert(`✅ ${newSelectedReqs.length} requirement(s) prepared for application!\n\n` +
            `Requirements will be automatically applied when opening a Work Item.\n` +
            `If you have a Work Item open, the section will update automatically.\n\n` +
            `🔄 Auto-refresh activated!`);
      
      // Limpiar la selección actual después de un delay reducido
      setTimeout(() => {
        setCheckedRequirements([]);
        setShowSelectedPanel(false);
        console.log('🧹 Selection cleared');
      }, 2000); // Tiempo reducido para mejor UX
      
    } catch (e) {
      console.error('Error preparing requirements for application:', e);
    }
  };

  // Remover un requisito de la selección
  const removeSelectedRequirement = (reqId: string) => {
    setCheckedRequirements(prev => prev.filter(id => id !== reqId));
  };

  if (loading) return <div className="loading">Loading sustainability requirements...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="sustainability-requirements-container">
      <h1>CRETS4DevOps</h1>
      <h2>Sustainability Requirements</h2>
      
      <div className="toolbar">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search requirements..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="actions">
          <button
            className="create-button"
            onClick={() => {
              console.log('Create Requirement button clicked');
              setIsCreating(true);
            }}
            disabled={isCreating}
          >
            Create Requirement
          </button>
          <button
            className="apply-button"
            onClick={saveSelectedRequirements}
            disabled={checkedRequirements.length === 0}
          >
            Apply to Work Item ({checkedRequirements.length})
          </button>
        </div>
      </div>
      
      {/* Selected requirements panel */}
      {showSelectedPanel && (
        <div className="selected-requirements-panel">
          <div className="panel-header">
            <h3>Selected Requirements</h3>
            <button 
              className="close-button"
              onClick={() => setShowSelectedPanel(false)}
            >
              Close
            </button>
          </div>
          <div className="selected-requirements-list">
            {checkedRequirements.length > 0 ? (
              checkedRequirements.map(reqId => {
                const req = requirements.find(r => r.id === reqId);
                return req ? (
                  <div key={req.id} className="selected-requirement-item">
                    <span className="requirement-code">{req.displayCode}</span>
                    <span className="requirement-detail">{req.attrs.detail}</span>
                    <button 
                      className="remove-button"
                      onClick={() => removeSelectedRequirement(req.id)}
                    >
                      X
                    </button>
                  </div>
                ) : null;
              })
            ) : (
              <div className="no-selected">No requirements selected</div>
            )}
          </div>
          <div className="panel-footer">
            <button 
              className="clear-button"
              onClick={() => setCheckedRequirements([])}
              disabled={checkedRequirements.length === 0}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
      
      <div className="main-content">
        <div className="requirements-list">
          {searchTerm.trim() === '' ? (
            // Mostrar estructura jerárquica cuando no hay búsqueda
            topLevelRequirements.length > 0 ? (
              topLevelRequirements.map(req => (
                req && req.id ? (
                  <RequirementItem 
                    key={req.id} 
                    requirement={req} 
                    requirements={requirements}
                    selectedRequirement={selectedRequirement}
                    onSelect={handleSelectRequirement}
                    onEdit={handleEditRequirement}
                    onDelete={handleDeleteRequirement}
                    level={0}
                    isChecked={isRequirementChecked(req.id)}
                    onCheckChange={handleCheckRequirement}
                    checkedRequirements={checkedRequirements}
                  />
                ) : null
              ))
            ) : (
              <div className="no-data">No top-level requirements found</div>
            )
          ) : (
            // Mostrar resultados de búsqueda sin jerarquía
            filteredRequirements.length > 0 ? (
              filteredRequirements.map(req => (
                req && req.id ? (
                  <div 
                    key={req.id} 
                    className={`search-result-item ${selectedRequirement && selectedRequirement.id === req.id ? 'selected' : ''}`}
                    onClick={() => handleSelectRequirement(req)}
                  >
                    <div className="search-result-content">
                      <input 
                        type="checkbox" 
                        className="requirement-checkbox"
                        checked={isRequirementChecked(req.id)}
                        onChange={(e) => handleCheckRequirement(req, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="requirement-code">{req.displayCode || ''}</span>
                      <span className="requirement-detail">{req.attrs && req.attrs.detail ? req.attrs.detail : ''}</span>
                    </div>
                    <div className="requirement-actions">
                      <button onClick={(e) => { e.stopPropagation(); handleEditRequirement(req); }}>Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteRequirement(req); }}>Remove</button>
                    </div>
                  </div>
                ) : null
              ))
            ) : (
              <div className="no-data">No requirements match your search</div>
            )
          )}
        </div>
        
        <div className="detail-panel">
          {isCreating ? (
            <>
              {console.log('Rendering RequirementCreateForm, isCreating:', isCreating)}
              <RequirementCreateForm 
                requirements={requirements}
                onSave={handleCreateRequirement}
                onCancel={() => {
                  console.log('Cancel button clicked');
                  setIsCreating(false);
                }}
              />
            </>
          ) : isEditing && selectedRequirement ? (
            <RequirementEditForm 
              requirement={selectedRequirement}
              onSave={handleSaveRequirement}
              onCancel={() => setIsEditing(false)}
            />
          ) : selectedRequirement ? (
            <div className="requirement-details">
              <h2>{selectedRequirement.displayCode}</h2>
              <p className="detail-text">{selectedRequirement.attrs.detail}</p>
              
              {selectedRequirement.attrs.Justification && (
                <>
                  <h3>Justification</h3>
                  <p className="detail-text">{selectedRequirement.attrs.Justification}</p>
                </>
              )}
              
              {selectedRequirement.attrs.Discussion && (
                <>
                  <h3>Discussion</h3>
                  <p className="detail-text">{selectedRequirement.attrs.Discussion}</p>
                </>
              )}
              
              <div className="detail-actions">
                <button 
                  className="edit-button" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
                <button 
                  className="delete-button" 
                  onClick={() => handleDeleteRequirement(selectedRequirement)}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a requirement to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Renderizar el componente en el DOM
ReactDOM.render(<SustainabilityRequirements />, document.getElementById('root'));
