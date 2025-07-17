<script lang="ts" setup>
const routes = ref([
    { name: 'user.user', to: '/user' },
]);
</script>

<template>
    <ShellLayout :navigation="routes">
        <div class="w-full h-full flex flex-col ">
            <NuxtPage />
        </div>
    </ShellLayout>
</template>
