<script setup lang="ts">
defineProps({
    title: {
        type: String,
        required: true,
    },
    info: {
        type: String,
        required: false,
        default: '',
    },
});
</script>

<template>
    <span class="flex flex-col gap-0.5 items-start justify-center">
        <h3 class="text-base font-semibold whitespace-nowrap">
            {{ title }}
        </h3>
        <h4 v-if="info" class="text-sm text-gray-400">
            {{ info }}
        </h4>
    </span>
</template>
