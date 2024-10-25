import axios from 'axios'
import { useRuntimeConfig } from '#app'

// Crée une fonction qui retourne une instance Axios
export const api = () => {
  const config = useRuntimeConfig()

  return axios.create({
    baseURL: 'https://www.bungie.net/Platform',
    headers: {
      'X-API-Key': config.public.bungieApiKey as string // Assure-toi que la clé API est typée en string
    }
  })
}

export const getTriumphs = async (membershipType: number, destinyMembershipId: string) => {
  try {
    const response = await api().get(`/Destiny2/${membershipType}/Profile/${destinyMembershipId}/?components=Records`,)
    
    const records = response.data.Response.profileRecords.data.records
    const triumphData: any[] = []

    // Extraire le hash et le statut de complétion
    Object.keys(records).forEach(hash => {
        const record = records[hash];
        
        // Vérifie si objectives existe et est un tableau
        const objectives = record.objectives || []; // Utilise un tableau vide si objectives est undefined

        // Crée un tableau pour les statuts de chaque objectif
        const objectiveStatus = objectives.map((objective: any) => ({
            complete: objective.complete, // Statut de complétion de l'objectif
            progress: objective.progress, // Progrès de l'objectif
            completionValue: objective.completionValue // Valeur d'achèvement de l'objectif
        }));
          
      var isComplete = false
      if(!objectives){
        isComplete = objectiveStatus.every((obj: any) => obj.complete);
      }
      
      triumphData.push({
        hash, // Hash du record
        complete: isComplete, // Statut de complétion
        objectives: objectiveStatus // Statuts de tous les objectifs
      });
    });

    return triumphData
  } catch (error) {
    console.error('Error fetching triumphs:', error)
    throw error
  }
}

export const getManifest = async () => {
  const response = await api().get('/Destiny2/Manifest/');
  const manifestData = response.data.Response.jsonWorldComponentContentPaths;

  console.log('Manifest data:', manifestData); // Ajoutez cette ligne

  if (manifestData.en && manifestData.en['DestinyPresentationNodeDefinition']) {
    return manifestData.en['DestinyPresentationNodeDefinition'];
  } else {
    throw new Error('DestinyPresentationNodeDefinition not found in manifest');
  }
};

export const getTriumphCategories = async () => {
  try {
    const presentationNodesPath = await getManifest()
    const response = await axios.get(`https://www.bungie.net${presentationNodesPath}`)
    
    const presentationNodes = response.data
    const recordCategories = Object.values(presentationNodes).filter((node: any) => {
      return node.parentNodeHashes && node.parentNodeHashes == '1866538467' && node.displayProperties.name.length > 0;
    });

    console.log('Fetched record categories:', recordCategories);

    return await Promise.all(recordCategories.map(async (node: any) => ({
      hash: node.hash,
      name: node.displayProperties.name,
      description: node.displayProperties.description,
      subCategories: await getRecordSubCategories(node.hash, presentationNodes) // Changer parentNodeHash en node.hash
    })));
  } catch (error) {
    console.error('Error fetching record categories:', error)
    throw error
  }
}

const getRecordSubCategories = async (parentNodeHash: string, data: any) => {
  try {
    const presentationNodes = data
    const recordCategories = Object.values(presentationNodes).filter((node: any) => {
      return node.parentNodeHashes && node.parentNodeHashes.includes(parentNodeHash) && node.displayProperties.name.length > 0
    })

    return await Promise.all(recordCategories.map(async (node: any) => ({
      hash: node.hash,
      name: node.displayProperties.name,
      description: node.displayProperties.description,
      subSubCategories: await getRecordSubSubCategories(node.hash, data) // Utiliser node.hash
    })));
  } catch (error) {
    console.error('Error fetching record categories:', error)
    throw error
  }
}

const getRecordSubSubCategories = async (parentNodeHash: string, data: any) => {
  try {
    const presentationNodes = data
    const recordCategories = Object.values(presentationNodes).filter((node: any) => {
      return node.parentNodeHashes && node.parentNodeHashes.includes(parentNodeHash) && node.displayProperties.name.length > 0
    })

    return recordCategories.map((node: any) => ({
      hash: node.hash,
      name: node.displayProperties.name,
      description: node.displayProperties.description
    }))
  } catch (error) {
    console.error('Error fetching record categories:', error)
    throw error
  }
}