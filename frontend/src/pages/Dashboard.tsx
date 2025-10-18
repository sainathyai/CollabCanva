/**
 * Dashboard Page
 *
 * Displays user's projects and allows creating new projects
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, signOut } from '../lib/auth'
import { useProject } from '../contexts/ProjectContext'
import { getUserProjects, createProject, deleteProject, updateProject, addCollaborator, removeCollaborator } from '../lib/projectApi'
import type { Project } from '../contexts/ProjectContext'

function Dashboard() {
  const user = getCurrentUser()
  const { projects, setProjects } = useProject()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Edit project state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editProjectName, setEditProjectName] = useState('')
  const [editProjectDescription, setEditProjectDescription] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Collaborator management state
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('')
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<'editor' | 'viewer'>('editor')
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false)
  const [collaboratorError, setCollaboratorError] = useState<string | null>(null)

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [user])

  async function loadProjects() {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const userProjects = await getUserProjects(user.uid, user.email || undefined)
      setProjects(userProjects)
      console.log('Loaded projects:', userProjects.length, 'projects')
      console.log('User email:', user.email)
    } catch (err) {
      console.error('Failed to load projects:', err)
      setError('Failed to load projects. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !newProjectName.trim()) return

    setIsCreating(true)
    setError(null)

    try {
      const project = await createProject(
        user.uid,
        newProjectName.trim(),
        newProjectDescription.trim() || undefined
      )

      // Add to projects list
      setProjects([project, ...projects])

      // Reset form and close modal
      setNewProjectName('')
      setNewProjectDescription('')
      setShowCreateModal(false)

      // Navigate to new project
      navigate(`/canvas/${project.projectId}`)
    } catch (err) {
      console.error('Failed to create project:', err)
      setError('Failed to create project. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteProject(projectId: string) {
    if (!user) return
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      await deleteProject(projectId, user.uid)
      setProjects(projects.filter(p => p.projectId !== projectId))
    } catch (err) {
      console.error('Failed to delete project:', err)
      setError('Failed to delete project. Please try again.')
    }
  }

  function handleOpenProject(projectId: string) {
    navigate(`/canvas/${projectId}`)
  }

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  function handleEditProject(project: Project) {
    setEditingProject(project)
    setEditProjectName(project.name)
    setEditProjectDescription(project.description || '')
    setShowEditModal(true)
  }

  async function handleUpdateProject(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !editingProject || !editProjectName.trim()) return

    setIsUpdating(true)
    setError(null)

    try {
      const updatedProject = await updateProject(
        editingProject.projectId,
        user.uid,
        {
          name: editProjectName.trim(),
          description: editProjectDescription.trim() || undefined
        }
      )

      // Update project in list
      setProjects(projects.map(p =>
        p.projectId === updatedProject.projectId ? updatedProject : p
      ))

      // Reset form and close modal
      setEditProjectName('')
      setEditProjectDescription('')
      setEditingProject(null)
      setShowEditModal(false)
    } catch (err) {
      console.error('Failed to update project:', err)
      setError('Failed to update project. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  function handleManageCollaborators(project: Project) {
    setSelectedProject(project)
    setShowCollaboratorsModal(true)
    setCollaboratorError(null)
  }

  async function handleAddCollaborator(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !selectedProject || !newCollaboratorEmail.trim()) return

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newCollaboratorEmail.trim())) {
      setCollaboratorError('Please enter a valid email address')
      return
    }

    setIsAddingCollaborator(true)
    setCollaboratorError(null)

    try {
      const updatedProject = await addCollaborator(
        selectedProject.projectId,
        user.uid,
        newCollaboratorEmail.trim(),
        newCollaboratorRole
      )

      // Update project in list
      setProjects(projects.map(p =>
        p.projectId === updatedProject.projectId ? updatedProject : p
      ))
      setSelectedProject(updatedProject)

      // Reset form
      setNewCollaboratorEmail('')
      setNewCollaboratorRole('editor')
    } catch (err) {
      console.error('Failed to add collaborator:', err)
      setCollaboratorError('Failed to add collaborator. They may already have access.')
    } finally {
      setIsAddingCollaborator(false)
    }
  }

  async function handleRemoveCollaborator(email: string) {
    if (!user || !selectedProject) return
    if (!confirm(`Remove ${email} from this project?`)) return

    try {
      const updatedProject = await removeCollaborator(
        selectedProject.projectId,
        user.uid,
        email
      )

      // Update project in list
      setProjects(projects.map(p =>
        p.projectId === updatedProject.projectId ? updatedProject : p
      ))
      setSelectedProject(updatedProject)
    } catch (err) {
      console.error('Failed to remove collaborator:', err)
      setCollaboratorError('Failed to remove collaborator. Please try again.')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your projects.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo: Collaboration Nodes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="18" fill="#dbeafe" />
                <circle cx="16" cy="16" r="5" fill="#2563eb" />
                <circle cx="32" cy="16" r="5" fill="#7c3aed" />
                <circle cx="24" cy="32" r="5" fill="#8b5cf6" />
                <line x1="16" y1="16" x2="32" y2="16" stroke="#2563eb" strokeWidth="2.5" />
                <line x1="16" y1="16" x2="24" y2="32" stroke="#2563eb" strokeWidth="2.5" />
                <line x1="32" y1="16" x2="24" y2="32" stroke="#7c3aed" strokeWidth="2.5" />
              </svg>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2563eb' }}>CollabCanvas</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.displayName || user.email}</span>
              <button
                onClick={handleSignOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Welcome Section */}
        <div style={{
          marginBottom: '2.5rem',
          padding: '1.5rem 2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.3)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '0.25rem',
            letterSpacing: '0.02em'
          }}>
            Welcome back, {user.displayName || user.email}! 👋
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: '400'
          }}>
            Manage and collaborate on your canvas projects
          </p>
        </div>

        {error && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            borderRadius: '0.5rem',
            color: '#991b1b',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                width: '3rem',
                height: '3rem',
                border: '4px solid #bfdbfe',
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '1rem', fontSize: '1.125rem', color: '#6b7280' }}>Loading projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '8rem 0' }}>
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '3rem',
              maxWidth: '28rem',
              margin: '0 auto'
            }}>
              <div style={{
                width: '6rem',
                height: '6rem',
                background: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <svg style={{ width: '3rem', height: '3rem', color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>No projects yet</h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Get started by creating your first collaborative canvas project.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  padding: '1rem 2rem',
                  background: '#2563eb',
                  color: 'white',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
              >
                Create Your First Project
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* My Projects Section */}
            <ProjectSection
              title="My Projects"
              projects={projects.filter(p => p.ownerId === user?.uid)}
              user={user}
              onOpenProject={handleOpenProject}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onManageCollaborators={handleManageCollaborators}
              showNewProjectCard={true}
              onCreateProject={() => setShowCreateModal(true)}
            />

            {/* Collaborative Projects Section */}
            {projects.some(p => p.ownerId !== user?.uid && p.collaborators?.some(c => c.email === user?.email)) && (
              <ProjectSection
                title="Collab Projects"
                projects={projects.filter(p => p.ownerId !== user?.uid && p.collaborators?.some(c => c.email === user?.email))}
                user={user}
                onOpenProject={handleOpenProject}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteProject}
                onManageCollaborators={handleManageCollaborators}
                showNewProjectCard={false}
                onCreateProject={() => setShowCreateModal(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: '0',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: '50',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            maxWidth: '32rem',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>Create New Project</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewProjectName('')
                  setNewProjectDescription('')
                }}
                style={{
                  color: '#9ca3af',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#6b7280'}
                onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
              >
                <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Project Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="My Awesome Project"
                  required
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label htmlFor="description" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    resize: 'none',
                    transition: 'all 0.2s',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  rows={4}
                  placeholder="Describe your project..."
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewProjectName('')
                    setNewProjectDescription('')
                  }}
                  style={{
                    flex: '1',
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #d1d5db',
                    color: '#374151',
                    borderRadius: '0.75rem',
                    background: 'white',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: isCreating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => !isCreating && (e.currentTarget.style.background = '#f9fafb')}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: '1',
                    padding: '0.75rem 1.5rem',
                    background: (!newProjectName.trim() || isCreating) ? '#93c5fd' : '#2563eb',
                    color: 'white',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: (!newProjectName.trim() || isCreating) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (!isCreating && newProjectName.trim()) {
                      e.currentTarget.style.background = '#1d4ed8'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isCreating && newProjectName.trim()) {
                      e.currentTarget.style.background = '#2563eb'
                    }
                  }}
                  disabled={isCreating || !newProjectName.trim()}
                >
                  {isCreating ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '1rem',
                        height: '1rem',
                        border: '2px solid white',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }}></div>
                      Creating...
                    </span>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Collaborators Modal */}
      {showCollaboratorsModal && selectedProject && (
        <div style={{
          position: 'fixed',
          inset: '0',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: '50',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            maxWidth: '36rem',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            animation: 'slideUp 0.3s ease-out',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>Manage Access</h2>
              <button
                onClick={() => {
                  setShowCollaboratorsModal(false)
                  setSelectedProject(null)
                  setNewCollaboratorEmail('')
                  setCollaboratorError(null)
                }}
                style={{
                  color: '#9ca3af',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#6b7280'}
                onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
              >
                <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                {selectedProject.name}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Share this project with collaborators by email
              </p>
            </div>

            {collaboratorError && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '0.875rem',
                background: '#fef2f2',
                borderLeft: '4px solid #ef4444',
                borderRadius: '0.5rem',
                color: '#991b1b',
                fontSize: '0.875rem'
              }}>
                {collaboratorError}
              </div>
            )}

            {/* Add Collaborator Form */}
            <form onSubmit={handleAddCollaborator} style={{ marginBottom: '2rem' }}>
              <label htmlFor="collaborator-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Add Collaborator
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <input
                  id="collaborator-email"
                  type="email"
                  value={newCollaboratorEmail}
                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  style={{
                    flex: '1',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="collaborator@example.com"
                  disabled={isAddingCollaborator}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <select
                  value={newCollaboratorRole}
                  onChange={(e) => setNewCollaboratorRole(e.target.value as 'editor' | 'viewer')}
                  style={{
                    flex: '1',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none',
                    cursor: 'pointer',
                    background: 'white'
                  }}
                  disabled={isAddingCollaborator}
                >
                  <option value="editor">Editor (can create & edit)</option>
                  <option value="viewer">Viewer (read-only)</option>
                </select>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: (!newCollaboratorEmail.trim() || isAddingCollaborator) ? '#93c5fd' : '#2563eb',
                    color: 'white',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: (!newCollaboratorEmail.trim() || isAddingCollaborator) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => {
                    if (!isAddingCollaborator && newCollaboratorEmail.trim()) {
                      e.currentTarget.style.background = '#1d4ed8'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isAddingCollaborator && newCollaboratorEmail.trim()) {
                      e.currentTarget.style.background = '#2563eb'
                    }
                  }}
                  disabled={isAddingCollaborator || !newCollaboratorEmail.trim()}
                >
                  {isAddingCollaborator ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '1rem',
                        height: '1rem',
                        border: '2px solid white',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }}></div>
                      Adding...
                    </span>
                  ) : (
                    'Add'
                  )}
                </button>
              </div>
            </form>

            {/* Collaborator List */}
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                People with access ({(selectedProject.collaborators?.length || 0) + 1})
              </h3>

              {/* Owner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: '#f9fafb',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                      {user?.displayName || user?.email}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {user?.email}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#2563eb',
                  background: '#dbeafe',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontWeight: '600'
                }}>
                  Owner
                </span>
              </div>

              {/* Collaborators */}
              {selectedProject.collaborators && selectedProject.collaborators.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedProject.collaborators.map((collab) => (
                    <div
                      key={collab.email}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: '#f9fafb',
                        borderRadius: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          background: collab.role === 'viewer'
                            ? 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)'
                            : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600'
                        }}>
                          {collab.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                            {collab.email}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {collab.role === 'viewer' ? '👁️ Viewer (read-only)' : '✏️ Editor'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveCollaborator(collab.email)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.75rem',
                          color: '#dc2626',
                          background: 'transparent',
                          borderRadius: '0.5rem',
                          border: '1px solid #fecaca',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#fef2f2'
                          e.currentTarget.style.borderColor = '#dc2626'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.borderColor = '#fecaca'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  background: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '2px dashed #e5e7eb'
                }}>
                  No collaborators yet. Add someone above to start collaborating!
                </div>
              )}
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={() => {
                  setShowCollaboratorsModal(false)
                  setSelectedProject(null)
                  setNewCollaboratorEmail('')
                  setCollaboratorError(null)
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <div style={{
          position: 'fixed',
          inset: '0',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: '50',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            maxWidth: '32rem',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>Edit Project</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditProjectName('')
                  setEditProjectDescription('')
                  setEditingProject(null)
                }}
                style={{
                  color: '#9ca3af',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#6b7280'}
                onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
              >
                <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateProject}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="edit-name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Project Name *
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="My Awesome Project"
                  required
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label htmlFor="edit-description" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Description (optional)
                </label>
                <textarea
                  id="edit-description"
                  value={editProjectDescription}
                  onChange={(e) => setEditProjectDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    resize: 'none',
                    transition: 'all 0.2s',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  rows={4}
                  placeholder="Describe your project..."
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditProjectName('')
                    setEditProjectDescription('')
                    setEditingProject(null)
                  }}
                  style={{
                    flex: '1',
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #d1d5db',
                    color: '#374151',
                    borderRadius: '0.75rem',
                    background: 'white',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => !isUpdating && (e.currentTarget.style.background = '#f9fafb')}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: '1',
                    padding: '0.75rem 1.5rem',
                    background: (!editProjectName.trim() || isUpdating) ? '#93c5fd' : '#2563eb',
                    color: 'white',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: (!editProjectName.trim() || isUpdating) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (!isUpdating && editProjectName.trim()) {
                      e.currentTarget.style.background = '#1d4ed8'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isUpdating && editProjectName.trim()) {
                      e.currentTarget.style.background = '#2563eb'
                    }
                  }}
                  disabled={isUpdating || !editProjectName.trim()}
                >
                  {isUpdating ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '1rem',
                        height: '1rem',
                        border: '2px solid white',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }}></div>
                      Updating...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Project Section Component with horizontal scrolling
interface ProjectSectionProps {
  title: string
  projects: Project[]
  user: any
  onOpenProject: (projectId: string) => void
  onEditProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  onManageCollaborators: (project: Project) => void
  showNewProjectCard: boolean
  onCreateProject: () => void
}

function ProjectSection({
  title,
  projects,
  user,
  onOpenProject,
  onEditProject,
  onDeleteProject,
  onManageCollaborators,
  showNewProjectCard,
  onCreateProject
}: ProjectSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  useEffect(() => {
    updateScrollButtons()
    window.addEventListener('resize', updateScrollButtons)
    return () => window.removeEventListener('resize', updateScrollButtons)
  }, [projects, updateScrollButtons])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320 // Card width + gap
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })

      setTimeout(updateScrollButtons, 300)
    }
  }

  if (projects.length === 0 && !showNewProjectCard) return null

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h3 style={{
          fontSize: '1.75rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em'
        }}>
          {title}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: canScrollLeft ? '#2563eb' : '#e5e7eb',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canScrollLeft ? 'pointer' : 'not-allowed',
              opacity: canScrollLeft ? 1 : 0.5,
              transition: 'all 0.2s',
              boxShadow: canScrollLeft ? '0 4px 6px -1px rgba(37, 99, 235, 0.3)' : 'none'
            }}
            onMouseOver={(e) => canScrollLeft && (e.currentTarget.style.background = '#1d4ed8')}
            onMouseOut={(e) => canScrollLeft && (e.currentTarget.style.background = '#2563eb')}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: canScrollRight ? '#2563eb' : '#e5e7eb',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canScrollRight ? 'pointer' : 'not-allowed',
              opacity: canScrollRight ? 1 : 0.5,
              transition: 'all 0.2s',
              boxShadow: canScrollRight ? '0 4px 6px -1px rgba(37, 99, 235, 0.3)' : 'none'
            }}
            onMouseOver={(e) => canScrollRight && (e.currentTarget.style.background = '#1d4ed8')}
            onMouseOut={(e) => canScrollRight && (e.currentTarget.style.background = '#2563eb')}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={updateScrollButtons}
        style={{
          display: 'flex',
          gap: '1.5rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '0.5rem'
        }}
      >
        {projects.map((project) => {
          const isOwner = project.ownerId === user?.uid
          return (
            <div key={project.projectId} style={{ minWidth: '280px', maxWidth: '280px' }}>
              <ProjectCard
                project={project}
                currentUserEmail={user?.email || undefined}
                isOwner={isOwner}
                onOpen={() => onOpenProject(project.projectId)}
                onEdit={() => onEditProject(project)}
                onDelete={() => onDeleteProject(project.projectId)}
                onManageCollaborators={() => onManageCollaborators(project)}
              />
            </div>
          )
        })}

        {showNewProjectCard && (
          <div style={{ minWidth: '280px', maxWidth: '280px' }}>
            <NewProjectCard onClick={onCreateProject} />
          </div>
        )}
      </div>

      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

// New Project Card Component
interface NewProjectCardProps {
  onClick: () => void
}

function NewProjectCard({ onClick }: NewProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: isHovered ? '0 20px 25px -5px rgba(102, 126, 234, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s',
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0)',
        border: isHovered ? '2px solid #8b5cf6' : '2px dashed #c7d2fe',
        cursor: 'pointer',
        height: '100%',
        minHeight: '436px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div style={{
        width: '5rem',
        height: '5rem',
        borderRadius: '50%',
        background: isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(139, 92, 246, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        transition: 'all 0.3s',
        backdropFilter: 'blur(10px)'
      }}>
        <svg
          style={{
            width: '2.5rem',
            height: '2.5rem',
            color: isHovered ? 'white' : '#8b5cf6',
            transition: 'all 0.3s',
            strokeWidth: 2.5
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '700',
        color: isHovered ? 'white' : '#6b21a8',
        textAlign: 'center',
        transition: 'all 0.3s'
      }}>
        Create New Project
      </h3>
      <p style={{
        fontSize: '0.875rem',
        color: isHovered ? 'rgba(255, 255, 255, 0.9)' : '#7c3aed',
        textAlign: 'center',
        marginTop: '0.5rem',
        transition: 'all 0.3s'
      }}>
        Click to start a new canvas
      </p>
    </div>
  )
}

// Project Card Component
interface ProjectCardProps {
  project: Project
  currentUserEmail?: string
  isOwner: boolean
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  onManageCollaborators: () => void
}

function ProjectCard({ project, currentUserEmail, isOwner, onOpen, onEdit, onDelete, onManageCollaborators }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isEditHovered, setIsEditHovered] = useState(false)
  const [isDeleteHovered, setIsDeleteHovered] = useState(false)
  const [isAccessHovered, setIsAccessHovered] = useState(false)

  const collaborator = project.collaborators?.find(c => c.email === currentUserEmail)
  const isCollaborator = !isOwner && !!collaborator
  const userRole = isOwner ? 'owner' : (collaborator?.role || null)

  const formattedDate = new Date(project.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // Generate a consistent gradient based on project name
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  ]
  const gradientIndex = project.name.charCodeAt(0) % gradients.length
  const gradient = gradients[gradientIndex]

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: isHovered ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        border: '1px solid #e5e7eb',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div
        onClick={onOpen}
        style={{
          height: '12rem',
          background: gradient,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <span style={{
              fontSize: '4rem',
              fontWeight: '700',
              opacity: '0.9',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.3s'
            }}>
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: '1',
            letterSpacing: '-0.01em'
          }}>
            {project.name}
          </h3>
          {/* Role Badge */}
          {isCollaborator && (
            <span style={{
              fontSize: '0.65rem',
              color: '#7c3aed',
              background: '#f3e8ff',
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}>
              Collaborator
            </span>
          )}
        </div>

        <p style={{
          fontSize: '0.875rem',
          color: project.description ? '#6b7280' : '#9ca3af',
          fontStyle: project.description ? 'normal' : 'italic',
          marginBottom: '0.75rem',
          minHeight: '2.5rem',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {project.description || 'No description'}
        </p>

        {/* Badges - Fixed height container to maintain card consistency */}
        <div style={{ minHeight: '2.25rem', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {isCollaborator && userRole && (
            <div style={{
              fontSize: '0.75rem',
              color: userRole === 'viewer' ? '#7c3aed' : '#059669',
              background: userRole === 'viewer' ? '#f3e8ff' : '#d1fae5',
              padding: '0.375rem 0.625rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}>
              {userRole === 'viewer' ? '👁️ Viewer' : '✏️ Editor'}
            </div>
          )}
          {project.collaborators && project.collaborators.length > 0 && isOwner && (
            <div style={{
              fontSize: '0.75rem',
              color: '#2563eb',
              background: '#dbeafe',
              padding: '0.375rem 0.625rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}>
              <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Shared with {project.collaborators.length}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <button
            onClick={onOpen}
            style={{
              width: '100%',
              padding: '0.625rem 1rem',
              background: '#2563eb',
              color: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Open Project
          </button>
        </div>

        <div style={{
          paddingTop: '0.75rem',
          borderTop: '1px solid #f3f4f6'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Updated {formattedDate}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onManageCollaborators()
                }}
                onMouseEnter={() => setIsAccessHovered(true)}
                onMouseLeave={() => setIsAccessHovered(false)}
                style={{
                  flex: '1',
                  minWidth: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  color: '#7c3aed',
                  background: isAccessHovered ? '#f3e8ff' : 'transparent',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Access
              </button>
            )}
            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                onMouseEnter={() => setIsEditHovered(true)}
                onMouseLeave={() => setIsEditHovered(false)}
                style={{
                  flex: '1',
                  minWidth: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  color: '#2563eb',
                  background: isEditHovered ? '#eff6ff' : 'transparent',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                onMouseEnter={() => setIsDeleteHovered(true)}
                onMouseLeave={() => setIsDeleteHovered(false)}
                style={{
                  flex: '1',
                  minWidth: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  color: '#dc2626',
                  background: isDeleteHovered ? '#fef2f2' : 'transparent',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
