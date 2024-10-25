<template>
  <div>
    <h1>Destiny 2 Triumphs</h1>
    <div v-if="loading">
      Loading...
    </div>
    <div v-else>
      <div v-if="categories.length">
        <p v-for="(category, index) in categories" :key="index">
          {{ 
            `Category ${index + 1}: Hash: ${category.hash} Name: ${category.name}`
          }}
          <p v-for="(subCategory, subIndex) in category.subCategories" :key="subIndex" style="margin-left: 10%;">
            {{ 
              `SubCategory ${subIndex + 1}: Hash: ${subCategory.hash} Name: ${subCategory.name}`
            }}
            <p v-for="(subSubCategory, subSubIndex) in subCategory.subSubCategories" :key="subSubIndex" style="margin-left: 20%;">
              {{ 
                `SubSubCategory ${subSubIndex + 1}: Hash: ${subSubCategory.hash} Name: ${subSubCategory.name}`
              }}
            </p>
          </p>
        </p> 
      </div>
      <div v-if="triumphs.length">
        <div v-for="(record, index) in triumphs" :key="index" class="triumph">
          <h2>Record Hash: {{ record.hash }}</h2>
          <p>Status: {{ record.complete ? 'Complete' : 'Incomplete' }}</p>
          <div v-if="record.complete">
            <input type="checkbox" name="complete" checked disabled>
          </div>
          <div v-else>
            <input type="checkbox" name="not_complete" disabled>
          </div>
          <p v-for="(objective, index) in record.objectives" :key="index">
            {{ 
              objective.progress > objective.completionValue ?
              `Objective ${index + 1}: Complete: ${objective.complete} ${objective.completionValue}/${objective.completionValue}` :
              `Objective ${index + 1}: Complete: ${objective.complete} ${objective.progress}/${objective.completionValue}`
            }}
            <div v-if="objective.complete">
              <input type="checkbox" name="complete" checked disabled>
            </div>
            <div v-else>
              <input type="checkbox" name="not_complete" disabled>
            </div>
          </p> 
        </div>
      </div>
      <div v-else>
        <p>No triumphs found.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTriumphs } from '../services/api'
import { getTriumphCategories } from '../services/api'

const triumphs = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(true)

const fetchTriumphs = async () => {
  loading.value = true
  const membershipType = 3 // Remplace par le type de membership approprié
  const destinyMembershipId = '4611686018492529529' // Remplace par l'ID du joueur
  
  try {
    triumphs.value = await getTriumphs(membershipType, destinyMembershipId)
  } catch (error) {
    console.error('Error fetching triumphs:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    categories.value = await getTriumphCategories()
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

onMounted(() => {
  fetchCategories()
  fetchTriumphs()
})
</script>

<style scoped>
.triumph {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ddd;
}
</style>