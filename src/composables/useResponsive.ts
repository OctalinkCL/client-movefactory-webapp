import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'

export function useResponsive() {
    const bp = useBreakpoints(breakpointsTailwind)

    return {
        isMobile: bp.smaller('md'),
        isTablet: bp.between('md', 'lg'),
        isDesktop: bp.greaterOrEqual('lg'),
    }
}