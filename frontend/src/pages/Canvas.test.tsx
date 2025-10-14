import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import Canvas from './Canvas'
import { wsClient } from '../lib/ws'
import * as auth from '../lib/auth'

// Mock the auth module
vi.mock('../lib/auth', () => ({
  getCurrentUser: vi.fn()
}))

// Mock the WebSocket client
vi.mock('../lib/ws', () => {
  const messageHandlers = new Set<any>()
  
  return {
    wsClient: {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn(),
      send: vi.fn(),
      onMessage: vi.fn((handler) => {
        messageHandlers.add(handler)
        return () => messageHandlers.delete(handler)
      }),
      authenticate: vi.fn(),
      createObject: vi.fn(),
      updateObject: vi.fn(),
      deleteObject: vi.fn(),
      isConnected: vi.fn().mockReturnValue(true),
      // Helper to trigger message handlers in tests
      _triggerMessage: (message: any) => {
        messageHandlers.forEach(handler => handler(message))
      },
      _getHandlers: () => messageHandlers
    },
    MessageType: {
      AUTH: 'auth',
      AUTH_SUCCESS: 'auth.success',
      AUTH_ERROR: 'auth.error',
      INITIAL_STATE: 'initialState',
      OBJECT_CREATE: 'object.create',
      OBJECT_UPDATE: 'object.update',
      OBJECT_DELETE: 'object.delete',
      ERROR: 'error'
    }
  }
})

describe('Canvas Component', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    getIdToken: vi.fn().mockResolvedValue('mock-token')
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth.getCurrentUser as any).mockReturnValue(mockUser)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Connection and Authentication', () => {
    it('should render and connect to WebSocket', async () => {
      render(<Canvas />)
      
      await waitFor(() => {
        expect(wsClient.connect).toHaveBeenCalled()
      })
    })

    it('should authenticate after connection', async () => {
      render(<Canvas />)
      
      await waitFor(() => {
        expect(mockUser.getIdToken).toHaveBeenCalled()
        expect(wsClient.authenticate).toHaveBeenCalledWith('mock-token')
      })
    })

    it('should show authenticating status initially', () => {
      render(<Canvas />)
      
      expect(screen.getByText(/authenticating/i)).toBeInTheDocument()
    })

    it('should show connected status after authentication', async () => {
      render(<Canvas />)
      
      // Simulate authentication success
      await waitFor(() => {
        ;(wsClient as any)._triggerMessage({
          type: 'auth.success',
          userId: 'test-user-123',
          timestamp: new Date().toISOString()
        })
      })
      
      await waitFor(() => {
        expect(screen.getByText(/connected/i)).toBeInTheDocument()
      })
    })
  })

  describe('Initial State Loading', () => {
    it('should load initial canvas state from server', async () => {
      render(<Canvas />)
      
      const mockObjects = [
        {
          id: 'obj1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 150,
          height: 100,
          fill: '#FF0000',
          createdBy: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      // Simulate receiving initial state
      await waitFor(() => {
        ;(wsClient as any)._triggerMessage({
          type: 'initialState',
          objects: mockObjects,
          timestamp: new Date().toISOString()
        })
      })
      
      await waitFor(() => {
        expect(screen.getByText(/objects: 1/i)).toBeInTheDocument()
      })
    })

    it('should handle empty initial state', async () => {
      render(<Canvas />)
      
      await waitFor(() => {
        ;(wsClient as any)._triggerMessage({
          type: 'initialState',
          objects: [],
          timestamp: new Date().toISOString()
        })
      })
      
      await waitFor(() => {
        expect(screen.getByText(/objects: 0/i)).toBeInTheDocument()
      })
    })
  })

  describe('Object Creation', () => {
    it('should send create message when Add Rectangle is clicked', async () => {
      render(<Canvas />)
      
      // Simulate authentication
      await waitFor(() => {
        ;(wsClient as any)._triggerMessage({
          type: 'auth.success',
          userId: 'test-user-123',
          timestamp: new Date().toISOString()
        })
      })
      
      const addButton = screen.getByText(/add rectangle/i)
      expect(addButton).not.toBeDisabled()
      
      fireEvent.click(addButton)
      
      await waitFor(() => {
        expect(wsClient.createObject).toHaveBeenCalled()
        const call = (wsClient.createObject as any).mock.calls[0][0]
        expect(call).toMatchObject({
          type: 'rectangle',
          createdBy: 'test-user-123'
        })
      })
    })

    it('should disable Add Rectangle button when not authenticated', () => {
      render(<Canvas />)
      
      const addButton = screen.getByText(/add rectangle/i)
      expect(addButton).toBeDisabled()
    })

    it('should update object count when object is created', async () => {
      render(<Canvas />)
      
      await waitFor(() => {
        ;(wsClient as any)._triggerMessage({
          type: 'object.create',
          object: {
            id: 'new-obj',
            type: 'rectangle',
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            fill: '#FF0000',
            createdBy: 'user1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        })
      })
      
      await waitFor(() => {
        expect(screen.getByText(/objects: 1/i)).toBeInTheDocument()
      })
    })
  })

  describe('Object Update', () => {
    it('should handle object update messages', async () => {
      render(<Canvas />)
      
      // Add initial object
      await waitFor(() => {
        ;(wsClient as any)._triggerMessage({
          type: 'initialState',
          objects: [{
            id: 'obj1',
            type: 'rectangle',
            x: 100,
            y: 100,
            width: 150,
            height: 100,
            fill: '#FF0000',
            createdBy: 'user1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }],
          timestamp: new Date().toISOString()
        })
      })
      
      // Update the object
      await waitFor(() => {
        ;(wsClient as any)._triggerMessage({
          type: 'object.update',
          object: {
            id: 'obj1',
            x: 200,
            y: 200
          },
          timestamp: new Date().toISOString()
        })
      })
      
      // Object count should remain the same
      await waitFor(() => {
        expect(screen.getByText(/objects: 1/i)).toBeInTheDocument()
      })
    })
  })

  describe('Object Deletion', () => {
    it('should send delete message when Delete Selected is clicked', async () => {
      render(<Canvas />)
      
      // Authenticate and load initial state
      await waitFor(() => {
        ;(wsClient as any)._triggerMessage({ type: 'auth.success', userId: 'test-user-123', timestamp: new Date().toISOString() })
        ;(wsClient as any)._triggerMessage({
          type: 'initialState',
          objects: [{
            id: 'obj-to-delete',
            type: 'rectangle',
            x: 100,
            y: 100,
            width: 150,
            height: 100,
            fill: '#FF0000',
            createdBy: 'user1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }],
          timestamp: new Date().toISOString()
        })
      })
      
      // Get canvas and simulate click to select object
      const canvas = screen.getByRole('img')
      fireEvent.click(canvas, { clientX: 150, clientY: 150 })
      
      // Click delete button
      const deleteButton = screen.getByText(/delete selected/i)
      fireEvent.click(deleteButton)
      
      await waitFor(() => {
        expect(wsClient.deleteObject).toHaveBeenCalledWith('obj-to-delete')
      })
    })

    it('should disable Delete button when no object is selected', () => {
      render(<Canvas />)
      
      const deleteButton = screen.getByText(/delete selected/i)
      expect(deleteButton).toBeDisabled()
    })

    it('should update object count when object is deleted', async () => {
      render(<Canvas />)
      
      // Add initial objects
      await waitFor(() => {
        ;(wsClient as any)._triggerMessage({
          type: 'initialState',
          objects: [
            { id: 'obj1', type: 'rectangle', x: 100, y: 100, width: 100, height: 100, fill: '#FF0000', createdBy: 'user1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 'obj2', type: 'rectangle', x: 300, y: 300, width: 100, height: 100, fill: '#00FF00', createdBy: 'user2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ],
          timestamp: new Date().toISOString()
        })
      })
      
      expect(screen.getByText(/objects: 2/i)).toBeInTheDocument()
      
      // Delete one object
      await waitFor(() => {
        ;(wsClient as any)._triggerMessage({
          type: 'object.delete',
          objectId: 'obj1',
          timestamp: new Date().toISOString()
        })
      })
      
      await waitFor(() => {
        expect(screen.getByText(/objects: 1/i)).toBeInTheDocument()
      })
    })
  })

  describe('Canvas Rendering', () => {
    it('should render canvas element', () => {
      render(<Canvas />)
      
      const canvas = screen.getByRole('img') // Canvas has role="img" by default
      expect(canvas).toBeInTheDocument()
      expect(canvas).toHaveAttribute('width', '800')
      expect(canvas).toHaveAttribute('height', '600')
    })
  })

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockUser.getIdToken.mockRejectedValueOnce(new Error('Auth failed'))
      
      render(<Canvas />)
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to authenticate:',
          expect.any(Error)
        )
      })
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle WebSocket errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<Canvas />)
      
      await waitFor(() => {
        ;(wsClient as any)._triggerMessage({
          type: 'error',
          error: 'Something went wrong',
          timestamp: new Date().toISOString()
        })
      })
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('WebSocket error:', 'Something went wrong')
      })
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Cleanup', () => {
    it('should disconnect WebSocket on unmount', async () => {
      const { unmount } = render(<Canvas />)
      
      await waitFor(() => {
        expect(wsClient.connect).toHaveBeenCalled()
      })
      
      unmount()
      
      expect(wsClient.disconnect).toHaveBeenCalled()
    })
  })
})

