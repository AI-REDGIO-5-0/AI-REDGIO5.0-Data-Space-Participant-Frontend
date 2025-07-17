<script setup lang="ts">
import dayjs from 'dayjs';
import { prop } from 'ramda';
import { licenses } from '~/constants/licenses';

defineProps({
    assetOfferingDetails: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
    publicationDetails: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
    policy: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
    submitStatus: {
        type: String,
        required: true,
    },
});


const emit = defineEmits(['handlePageSelectionBackwards', 'submitAll']);
const fixKeywords = (keywords: string[]) => {
    const fixedKeywords = keywords.flatMap(item => item.split(','));
    return fixedKeywords;
};
const fixLicense = (licenseId: any) => {
    const license = licenses.find(item => item.id === licenseId);
    return license?.name;
}

</script>

<template>
    <div class="w-full h-full text-gray-700 space-y-8">
        <UCard>
            <template #header>
                <SubHeading
                    :title="$t('data.designer.assetOfferingDetails') + ' - ' + $t('preview')"
                    :info="$t('data.designer.assetOfferingDetailsInfo')"
                />
            </template>
            <div class="flex flex-col gap-8">
                <div class="flex gap-2 flex-col">
                    <span class="text-sm font-semibold text-gray-400">{{ $t('title') }}</span>
                    <span>{{ assetOfferingDetails?.title }}</span>
                </div>
                <div class="flex gap-2 flex-col">
                    <span class="text-sm font-semibold text-gray-400">{{ $t('description') }}</span>
                    <span>{{ assetOfferingDetails?.description }}</span>
                </div>
                
                <div class="flex gap-2 flex-col">
                    <span class="text-sm font-semibold text-gray-400">{{ $t('keywords') }}</span>
                    <div class="flex items-center gap-2">
                        <div
                            v-for="keyword in fixKeywords(assetOfferingDetails.keywords)"
                            :key="keyword"
                            class="bg-gray-100 text-gray-500 p-1 rounded-md"
                        >
                            {{ keyword }}
                        </div>
                    </div>
                </div>
            </div>
        </UCard>

        <UCard>
            <template #header>
                <SubHeading
                    :title="$t('data.designer.monetizationMethod') + ' - ' + $t('preview')"
                    :info="$t('data.designer.monetizationMethodInfo')"
                />
            </template>
            <div v-if="publicationDetails.type === 'one-off'" class="flex flex-col gap-8">
                <div class="flex items-start gap-8">
                    <!-- <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{
                            $t('data.designer.monetizationMethod')
                        }}</span>
                        <span>{{ $t('data.designer.oneOffSale') }}</span>
                    </div> -->
                    <!-- <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.oneOffPrice') }}</span>
                        <span>{{
                            publicationDetails.price + ' EUR'
                        }}</span>
                    </div> -->
                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('license') }}</span>
                        <span>{{ fixLicense(publicationDetails.license) }}</span>
                    </div>

                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('policy') }}</span>
                        <span>{{ policy.title }}</span>
                    </div>

                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.startDate') }}</span>
                        <span>{{ dayjs(publicationDetails.startDate).format('DD MMMM YYYY')}}</span>
                    </div>

                    <div class="flex gap-2 flex-col">
                        <span class="text-sm font-semibold text-gray-400">{{ $t('data.designer.termDate') }}</span>
                        <span>{{ dayjs(publicationDetails.termDate).format('DD MMMM YYYY') }}</span>
                    </div>
                    
                </div>
            </div>   
            
            <div class="w-full flex justify-between items-center mt-8">
                <UButton size="md" color="gray" variant="outline" @click="emit('handlePageSelectionBackwards', 1)">
                    {{ $t('back') }}
                </UButton>
                <div class="flex items-center gap-4 w-full justify-end">
                    <UAlert
                        v-show="submitStatus === 'error'"
                        icon="mingcute:alert-line"
                        color="red"
                        variant="subtle"
                        :description="$t('data.designer.errorInSubmitAsset')"
                        class="w-full max-w-xl"
                    />
                    <UAlert
                        v-show="submitStatus === 'success'"
                        icon="mingcute:alert-line"
                        color="green"
                        variant="subtle"
                        :description="$t('data.designer.assetSubmitted')"
                        class="w-full max-w-xl"
                    />
                    <UButton
                        :disabled="submitStatus === 'pending' || submitStatus === 'success'"
                        class="px-4 py-2 w-32 block"
                        @click="emit('submitAll')"
                    >
                        <UIcon v-if="submitStatus === 'pending'" name="svg-spinners:270-ring-with-bg" />
                        <span v-else> {{ $t('submit') }}</span>
                    </UButton>
                </div>
            </div>
        </UCard>
    </div>
</template>
