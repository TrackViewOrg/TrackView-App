import {
    updateProfileAvatar,
    getMFAFactors,
    verifyExistingFactor,
    enrollMFA,
    verifyAndEnableMFA,
    deleteFactor,
    initiateEmailChange,
    updateUsername,
    updateProfileVisibility
} from '@/lib/auth/settings'
import { createClient } from '@/lib/supabase/server'
import qrcode from 'qrcode'

jest.mock('@/lib/supabase/server')
jest.mock('qrcode')
jest.mock('next/cache')

describe('Settings Actions', () => {
    let mockSupabase: any

    beforeEach(() => {
        jest.clearAllMocks()

        mockSupabase = {
            auth: {
                getUser: jest.fn(),
                mfa: {
                    listFactors: jest.fn(),
                    challenge: jest.fn(),
                    verify: jest.fn(),
                    enroll: jest.fn(),
                    unenroll: jest.fn(),
                },
                updateUser: jest.fn(),
            },
            from: jest.fn(() => ({
                update: jest.fn(() => ({ eq: jest.fn() })),
                select: jest.fn(() => ({
                    ilike: jest.fn(() => ({
                        neq: jest.fn(() => ({
                            maybeSingle: jest.fn()
                        }))
                    }))
                }))
            }))
        };
        (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    describe('updateProfileAvatar', () => {
        it('should update avatar url', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '1' } } })
            const updateMock = jest.fn().mockResolvedValue({ error: null })
            mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({ eq: updateMock }))
            })

            const result = await updateProfileAvatar('http://new.avatar')
            expect(result).toEqual({ success: true })
            expect(updateMock).toHaveBeenCalled()
        })

        it('should throw error if unauthorized', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
            await expect(updateProfileAvatar('url')).rejects.toThrow('Unauthorized')
        })
    })

    describe('getMFAFactors', () => {
        it('should return verified totp factors', async () => {
            mockSupabase.auth.mfa.listFactors.mockResolvedValue({
                data: {
                    all: [
                        { factor_type: 'totp', status: 'verified', id: '1' },
                        { factor_type: 'totp', status: 'unverified', id: '2' },
                        { factor_type: 'phone', status: 'verified', id: '3' }
                    ]
                }
            })

            const result = await getMFAFactors()
            expect(result.factors).toHaveLength(1)
            expect(result.factors[0].id).toBe('1')
        })
    })

    describe('enrollMFA', () => {
        it('should return enrollment data with QR code', async () => {
            mockSupabase.auth.mfa.enroll.mockResolvedValue({
                data: { id: 'factor1', totp: { secret: 'secret123' } },
                error: null
            })
            ;(qrcode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,...')

            const result = await enrollMFA('My Device', 'user@example.com')
            
            expect(result).toEqual({
                factorId: 'factor1',
                qrCode: 'data:image/png;base64,...',
                secret: 'secret123'
            })
        })
    })

    describe('verifyAndEnableMFA', () => {
        it('should verify and enable factor', async () => {
            mockSupabase.auth.mfa.challenge.mockResolvedValue({ data: { id: 'chal1' } })
            mockSupabase.auth.mfa.verify.mockResolvedValue({ error: null })

            const result = await verifyAndEnableMFA('factor1', '123456')
            expect(result).toEqual({ success: true })
        })
    })

    describe('deleteFactor', () => {
        it('should unenroll factor', async () => {
            mockSupabase.auth.mfa.unenroll.mockResolvedValue({ error: null })
            const result = await deleteFactor('factor1')
            expect(result).toEqual({ success: true })
        })
    })

    describe('initiateEmailChange', () => {
        it('should update user email', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '1' } } })
            mockSupabase.auth.updateUser.mockResolvedValue({ error: null })

            const result = await initiateEmailChange('new@example.com')
            expect(result).toEqual({ success: true })
        })

        it('should validate email format', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '1' } } })
            const result = await initiateEmailChange('invalid-email')
            expect(result).toEqual({ error: 'Invalid email format' })
        })
    })

    describe('updateUsername', () => {
        it('should update username if unique', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '1' } } })
            
            const maybeSingleMock = jest.fn().mockResolvedValue({ data: null })
            const updateMock = jest.fn().mockResolvedValue({ error: null })

            mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                    ilike: jest.fn(() => ({
                        neq: jest.fn(() => ({
                            maybeSingle: maybeSingleMock
                        }))
                    }))
                })),
                update: jest.fn(() => ({ eq: updateMock }))
            })

            const result = await updateUsername('newname')
            expect(result).toEqual({ success: true })
        })

        it('should return error if username taken', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '1' } } })
            
            const maybeSingleMock = jest.fn().mockResolvedValue({ data: { id: '2' } })
            
            mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                    ilike: jest.fn(() => ({
                        neq: jest.fn(() => ({
                            maybeSingle: maybeSingleMock
                        }))
                    }))
                })),
                update: jest.fn() 
            })

            const result = await updateUsername('takenname')
            expect(result).toEqual({ error: 'Username is already taken' })
        })
    })

    describe('updateProfileVisibility', () => {
        it('should update visibility', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '1' } } })
            
            const eqMock = jest.fn().mockResolvedValue({ error: null })
            const updateFn = jest.fn(() => ({ eq: eqMock }))
            
            mockSupabase.from.mockReturnValue({
                update: updateFn
            })

            await updateProfileVisibility(true)
            
            expect(updateFn).toHaveBeenCalledWith({ profile_visible: true })
            expect(eqMock).toHaveBeenCalledWith('id', '1')
        })
    })
})
