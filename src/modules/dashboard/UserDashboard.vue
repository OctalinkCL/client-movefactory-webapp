<script setup lang="ts"></script>
<template>
  <div>
    <h3>user_dashboard</h3>
    <ul>
      <li v-for="n in 50" :key="n">
        Iteration number: {{ n }}
      </li>
    </ul>
  </div>
</template>
