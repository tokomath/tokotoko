"use client"

import React, { useEffect, useState, DragEvent, useRef } from "react";
import {
    Box,
    Card,
    CardActionArea,
    Button,
    Grid,
    Typography,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    CircularProgress,
    Menu,
    MenuItem,
    Checkbox,
} from "@mui/material";
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import FolderIcon from '@mui/icons-material/Folder';
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { TeacherGuard } from "@/lib/guard";
import { msg } from "@/msg-ja";

const stringToBrightColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 80%, 65%)`;
};

interface ClassData {
    id: string;
    name: string;
    icon: string | null;
    users: User[];
}

interface Props {
    classes: ClassData[];
}

const LOCAL_STORAGE_KEY = 'class_layout_prefs';

type LayoutNode = {
    id: string;
    type: 'item' | 'folder';
    parentId: string | null;
    order: number;
    name?: string;
    color?: string;
};

export function TeacherClassCards({ classes }: Props) {
    const [layout, setLayout] = useState<LayoutNode[]>([]);
    const [isClient, setIsClient] = useState(false);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });

    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [draggedId, setDraggedId] = useState<string | null>(null);

    const [bgContextMenu, setBgContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
    const [folderContextMenu, setFolderContextMenu] = useState<{ mouseX: number; mouseY: number; folderId: string } | null>(null);

    const [openFolderId, setOpenFolderId] = useState<string | null>(null);
    
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
    const [editFolderName, setEditFolderName] = useState('');

    const [colorFolderId, setColorFolderId] = useState<string | null>(null);
    const [editFolderColor, setEditFolderColor] = useState('#1976d2');
    const colorInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        let parsed: LayoutNode[] = saved ? JSON.parse(saved) : [];

        const existingItemIds = new Set(parsed.filter(n => n.type === 'item').map(n => String(n.id)));
        let maxOrder = parsed.length > 0 ? Math.max(...parsed.filter(n => n.parentId === null).map(n => n.order), 0) : 0;

        let hasNew = false;
        const newNodes: LayoutNode[] = [];
        classes.forEach(c => {
            if (!existingItemIds.has(String(c.id))) {
                maxOrder++;
                newNodes.push({ id: String(c.id), type: 'item', parentId: null, order: maxOrder });
                hasNew = true;
            }
        });

        const finalLayout = [...parsed, ...newNodes];
        setLayout(finalLayout);
        if (hasNew) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalLayout));
        }
    }, [classes]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsSelecting(true);
        setSelectionBox({ startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY });
        setSelectedIds([]);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isSelecting) return;
            setSelectionBox(prev => ({ ...prev, endX: e.clientX, endY: e.clientY }));

            const left = Math.min(selectionBox.startX, e.clientX);
            const right = Math.max(selectionBox.startX, e.clientX);
            const top = Math.min(selectionBox.startY, e.clientY);
            const bottom = Math.max(selectionBox.startY, e.clientY);

            const newSelected: string[] = [];
            document.querySelectorAll('.draggable-item').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (!(rect.right < left || rect.left > right || rect.bottom < top || rect.top > bottom)) {
                    const id = el.getAttribute('data-id');
                    if (id) newSelected.push(id);
                }
            });
            setSelectedIds(newSelected);
        };

        const handleMouseUp = () => setIsSelecting(false);

        if (isSelecting) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isSelecting, selectionBox.startX, selectionBox.startY]);

    const handleBgContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        setBgContextMenu(bgContextMenu === null ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6 } : null);
    };

    const handleFolderContextMenu = (event: React.MouseEvent, folderId: string) => {
        event.preventDefault();
        event.stopPropagation();
        setFolderContextMenu(folderContextMenu === null ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6, folderId } : null);
    };

    const handleCloseContextMenus = () => {
        setBgContextMenu(null);
        setFolderContextMenu(null);
    };

    const handleOpenFolderDialogFromMenu = () => {
        setFolderDialogOpen(true);
        handleCloseContextMenus();
    };

    const handleOpenRenameDialog = () => {
        if (!folderContextMenu) return;
        const folder = layout.find(n => n.id === folderContextMenu.folderId);
        if (folder) {
            setEditFolderName(folder.name || '');
            setRenameFolderId(folder.id);
            setRenameDialogOpen(true);
        }
        handleCloseContextMenus();
    };

    const handleTriggerColorPicker = () => {
        if (!folderContextMenu) return;
        const folder = layout.find(n => n.id === folderContextMenu.folderId);
        if (folder) {
            setEditFolderColor(folder.color || '#1976d2');
            setColorFolderId(folder.id);
            setTimeout(() => { if (colorInputRef.current) colorInputRef.current.click(); }, 0);
        }
        handleCloseContextMenus();
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setEditFolderColor(newColor);
        if (!colorFolderId) return;
        setLayout(prev => {
            const newLayout = prev.map(n => n.id === colorFolderId ? { ...n, color: newColor } : n);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
            return newLayout;
        });
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        const newFolder: LayoutNode = { id: 'folder-' + Date.now(), type: 'folder', parentId: null, order: layout.filter(n => n.parentId === null).length, name: newFolderName.trim() };
        const newLayout = [...layout, newFolder];
        setLayout(newLayout);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
        setFolderDialogOpen(false);
        setNewFolderName('');
    };

    const handleRenameFolder = () => {
        if (!renameFolderId || !editFolderName.trim()) return;
        setLayout(prev => {
            const newLayout = prev.map(n => n.id === renameFolderId ? { ...n, name: editFolderName.trim() } : n);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
            return newLayout;
        });
        setRenameDialogOpen(false);
        setRenameFolderId(null);
    };

    const handleDeleteFolderMenu = () => {
        if (!folderContextMenu) return;
        const folderId = folderContextMenu.folderId;
        handleCloseContextMenus();
        if (!window.confirm(msg.DELETE_FOLDER_CONFIRM || "フォルダを削除しますか？（中身のアイテムは外に移動されます）")) return;
        setLayout(prev => {
            const newLayout = prev.filter(n => n.id !== folderId).map(n => n.parentId === folderId ? { ...n, parentId: null } : n);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
            return newLayout;
        });
        if (openFolderId === folderId) setOpenFolderId(null);
    };

    const handleDragStart = (e: DragEvent, id: string) => {
        e.stopPropagation();
        setDraggedId(id);
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = "move";

        if (!selectedIds.includes(id)) {
            setSelectedIds([id]);
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const getMovingIds = (fallbackId: string | null) => {
        if (!fallbackId) return [];
        return selectedIds.includes(fallbackId) ? selectedIds : [fallbackId];
    };

    const executeDrop = (targetParentId: string | null, insertBeforeNodeId: string | null = null) => {
        const movingIds = getMovingIds(draggedId);
        if (movingIds.length === 0) return;
        
        if (targetParentId !== null) {
            const hasFolder = layout.some(n => movingIds.includes(n.id) && n.type === 'folder');
            if (hasFolder) return;
            if (movingIds.includes(targetParentId)) return;
        }

        setLayout(prev => {
            let newLayout = prev.map(n => movingIds.includes(n.id) ? { ...n, parentId: targetParentId } : n);
            const movingNodes = newLayout.filter(n => movingIds.includes(n.id));
            const siblings = newLayout.filter(n => n.parentId === targetParentId && !movingIds.includes(n.id)).sort((a, b) => a.order - b.order);
            
            const targetIndex = insertBeforeNodeId ? siblings.findIndex(n => n.id === insertBeforeNodeId) : siblings.length;
            const insertIndex = targetIndex !== -1 ? targetIndex : siblings.length;

            siblings.splice(insertIndex, 0, ...movingNodes);
            siblings.forEach((sib, idx) => {
                const nodeIndex = newLayout.findIndex(n => n.id === sib.id);
                if (nodeIndex !== -1) {
                    newLayout[nodeIndex] = { ...newLayout[nodeIndex], order: idx };
                }
            });

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
            return newLayout;
        });
        setDraggedId(null);
    };

    const handleDropOnItem = (e: DragEvent, targetId: string) => {
        e.preventDefault();
        e.stopPropagation();
        executeDrop(layout.find(n => n.id === targetId)?.parentId || null, targetId);
    };

    const handleDropOnFolder = (e: DragEvent, targetFolderId: string) => {
        e.preventDefault();
        e.stopPropagation();
        executeDrop(targetFolderId, null);
    };

    const handleDropOnRoot = (e: DragEvent) => {
        e.preventDefault();
        executeDrop(null, null);
    };

    const handleItemClickCapture = (e: React.MouseEvent, id: string) => {
        if (e.button !== 0) return; 
        if (e.ctrlKey || e.metaKey) {
            e.stopPropagation();
            e.preventDefault();
            setSelectedIds(prev => 
                prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
            );
        }
    };

    const ClassCardItem = ({ classData }: { classData: ClassData }) => {
        const router = useRouter();

        const detailButtonFunction = () => router.push("/classDetail?classId=" + classData.id);
        const manageButtonFunction = () => router.push("/teacher/createClass?classId=" + classData.id);
        const createTestButtonFunction = () => router.push("/teacher/createTest?classId=" + classData.id);

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1 }}>
                <CardActionArea onClick={detailButtonFunction} sx={{ flexGrow: 1 }}>
                    <CardContent sx={{ pb: 1, display: 'flex', alignItems: 'center' }}>
                        <Avatar src={classData.icon || undefined} sx={{ width: 48, height: 48, bgcolor: !classData.icon && classData.name ? stringToBrightColor(classData.name) : "#e0e0e0", fontSize: "1.2rem", mr: 2 }} variant="rounded">
                            {!classData.icon && classData.name ? classData.name.charAt(0).toUpperCase() : ""}
                        </Avatar>
                        <Typography variant="h6" component="div" sx={{ wordBreak: 'break-word', lineHeight: 1.2 }}>
                            {classData.name}
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions sx={{ flexWrap: 'wrap', pt: 0 }}>
                    <Button size="small" onClick={detailButtonFunction}>{msg.VIEW_DETAILS}</Button>
                    <Button size="small" onClick={manageButtonFunction}>{msg.MANAGE}</Button>
                    <Button size="small" onClick={createTestButtonFunction}>{msg.CREATE_TEST}</Button>
                </CardActions>
            </Box>
        );
    }

    if (!isClient) return <CircularProgress />;

    const rootNodes = layout.filter(n => n.parentId === null).sort((a, b) => a.order - b.order);

    return (
        <TeacherGuard>
            <Box onMouseDown={handleMouseDown} onDragOver={handleDragOver} onDrop={handleDropOnRoot} onContextMenu={handleBgContextMenu} sx={{ minHeight: '60vh', pb: 10, userSelect: isSelecting ? 'none' : 'auto', position: 'relative' }}>
                
                {isSelecting && (
                    <Box sx={{
                        position: 'fixed',
                        left: Math.min(selectionBox.startX, selectionBox.endX),
                        top: Math.min(selectionBox.startY, selectionBox.endY),
                        width: Math.abs(selectionBox.endX - selectionBox.startX),
                        height: Math.abs(selectionBox.endY - selectionBox.startY),
                        bgcolor: 'rgba(25, 118, 210, 0.2)',
                        border: '1px solid rgba(25, 118, 210, 0.5)',
                        pointerEvents: 'none',
                        zIndex: 9999,
                    }} />
                )}

                <Menu open={bgContextMenu !== null} onClose={handleCloseContextMenus} anchorReference="anchorPosition" anchorPosition={bgContextMenu !== null ? { top: bgContextMenu.mouseY, left: bgContextMenu.mouseX } : undefined}>
                    <MenuItem onClick={handleOpenFolderDialogFromMenu}>{msg.CREATE_FOLDER || "フォルダを作成"}</MenuItem>
                </Menu>

                <Menu open={folderContextMenu !== null} onClose={handleCloseContextMenus} anchorReference="anchorPosition" anchorPosition={folderContextMenu !== null ? { top: folderContextMenu.mouseY, left: folderContextMenu.mouseX } : undefined}>
                    <MenuItem onClick={handleOpenRenameDialog}>{msg.RENAME_FOLDER || "名前の変更"}</MenuItem>
                    <MenuItem onClick={handleTriggerColorPicker}>{msg.CHANGE_FOLDER_COLOR || "色の変更"}</MenuItem>
                    <MenuItem onClick={handleDeleteFolderMenu} sx={{ color: 'error.main' }}>{msg.DELETE_FOLDER || "削除"}</MenuItem>
                </Menu>

                <Grid container spacing={2}>
                    {rootNodes.map(node => {
                        const isSelected = selectedIds.includes(node.id);
                        if (node.type === 'folder') {
                            const children = layout.filter(n => n.parentId === node.id).sort((a, b) => a.order - b.order);
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={node.id}>
                                    <Card 
                                        className="draggable-item" data-id={node.id}
                                        draggable onDragStart={(e) => handleDragStart(e, node.id)} onDragOver={handleDragOver} onDrop={(e) => handleDropOnFolder(e, node.id)} onContextMenu={(e) => handleFolderContextMenu(e, node.id)} onMouseDown={(e) => e.stopPropagation()} 
                                        onClickCapture={(e) => handleItemClickCapture(e, node.id)}
                                        sx={{ display: 'flex', height: '100%', cursor: 'grab', bgcolor: 'grey.50', '&:hover': { bgcolor: 'grey.100' }, '&:hover .select-checkbox': { opacity: 1 }, ...(isSelected && { outline: '2px solid #1976d2', outlineOffset: '-2px' }) }}
                                    >
                                        <Box sx={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Checkbox
                                                className="select-checkbox"
                                                checked={isSelected}
                                                onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, node.id] : prev.filter(id => id !== node.id))}
                                                sx={{ opacity: isSelected ? 1 : 0, transition: 'opacity 0.2s' }}
                                            />
                                        </Box>
                                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, borderLeft: '1px solid', borderColor: 'divider' }}>
                                            <CardActionArea onClick={() => setOpenFolderId(node.id)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                                                <FolderIcon sx={{ fontSize: 40, color: node.color || 'primary.main', mb: 1 }} />
                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" sx={{ wordBreak: 'break-word' }}>
                                                    {node.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {children.length}  {msg.CLASS}
                                                </Typography>
                                            </CardActionArea>
                                        </Box>
                                    </Card>
                                </Grid>
                            );
                        } else {
                            const c = classes.find(cls => cls.id === node.id);
                            if (!c) return null;
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={node.id}>
                                    <Card 
                                        className="draggable-item" data-id={node.id}
                                        draggable onDragStart={(e) => handleDragStart(e, node.id)} onDragOver={handleDragOver} onDrop={(e) => handleDropOnItem(e, node.id)} onMouseDown={(e) => e.stopPropagation()} 
                                        onClickCapture={(e) => handleItemClickCapture(e, node.id)}
                                        sx={{ display: 'flex', height: '100%', cursor: 'grab', '&:hover .select-checkbox': { opacity: 1 }, ...(isSelected && { outline: '2px solid #1976d2', outlineOffset: '-2px' }) }}
                                    >
                                        <Box sx={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, bgcolor: 'grey.50' }}>
                                            <Checkbox
                                                className="select-checkbox"
                                                checked={isSelected}
                                                onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, node.id] : prev.filter(id => id !== node.id))}
                                                sx={{ opacity: isSelected ? 1 : 0, transition: 'opacity 0.2s' }}
                                            />
                                        </Box>
                                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, borderLeft: '1px solid', borderColor: 'divider' }}>
                                            <ClassCardItem classData={c} />
                                        </Box>
                                    </Card>
                                </Grid>
                            );
                        }
                    })}
                </Grid>

                <Dialog 
                    open={openFolderId !== null} 
                    onClose={() => setOpenFolderId(null)} 
                    maxWidth={false}
                    PaperProps={{ sx: { width: '80%', maxWidth: 'none' } }}
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                    {openFolderId && (
                        <Box onMouseDown={handleMouseDown} sx={{ position: 'relative', userSelect: isSelecting ? 'none' : 'auto' }}>
                            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box display="flex" alignItems="center" gap={1} onDragOver={handleDragOver} onDrop={(e) => handleDropOnFolder(e, openFolderId)}>
                                    <FolderIcon sx={{ color: layout.find(n => n.id === openFolderId)?.color || 'primary.main' }} />
                                    <Typography variant="h6">{layout.find(n => n.id === openFolderId)?.name}</Typography>
                                </Box>
                            </DialogTitle>
                            <DialogContent dividers sx={{ minHeight: '30vh', bgcolor: 'grey.50' }}>
                                <Grid container spacing={2}>
                                    {layout.filter(n => n.parentId === openFolderId).sort((a, b) => a.order - b.order).map(child => {
                                        const c = classes.find(cls => cls.id === child.id);
                                        if (!c) return null;
                                        const isSelected = selectedIds.includes(child.id);
                                        return (
                                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={child.id}>
                                                <Card 
                                                    className="draggable-item" data-id={child.id}
                                                    draggable onDragStart={(e) => handleDragStart(e, child.id)} onDragOver={handleDragOver} onDrop={(e) => handleDropOnItem(e, child.id)} onMouseDown={(e) => e.stopPropagation()} 
                                                    onClickCapture={(e) => handleItemClickCapture(e, child.id)}
                                                    sx={{ display: 'flex', height: '100%', cursor: 'grab', '&:hover .select-checkbox': { opacity: 1 }, ...(isSelected && { outline: '2px solid #1976d2', outlineOffset: '-2px' }) }}
                                                >
                                                    <Box sx={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, bgcolor: 'grey.50' }}>
                                                        <Checkbox
                                                            className="select-checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, child.id] : prev.filter(id => id !== child.id))}
                                                            sx={{ opacity: isSelected ? 1 : 0, transition: 'opacity 0.2s' }}
                                                        />
                                                    </Box>
                                                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, borderLeft: '1px solid', borderColor: 'divider' }}>
                                                        <ClassCardItem classData={c} />
                                                    </Box>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                    {layout.filter(n => n.parentId === openFolderId).length === 0 && (
                                        <Grid size={{ xs: 12 }}><Typography textAlign="center" color="text.secondary" mt={4}>空のフォルダです</Typography></Grid>
                                    )}
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenFolderId(null)}>{msg.BACK || "閉じる"}</Button>
                            </DialogActions>
                        </Box>
                    )}
                </Dialog>

                <Dialog open={folderDialogOpen} onClose={() => setFolderDialogOpen(false)}>
                    <DialogTitle>{msg.CREATE_FOLDER || "新しいフォルダを作成"}</DialogTitle>
                    <DialogContent>
                        <TextField autoFocus margin="dense" label={msg.NEW_FOLDER_NAME || "フォルダ名"} type="text" fullWidth variant="outlined" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setFolderDialogOpen(false)}>{msg.CANCEL}</Button>
                        <Button onClick={handleCreateFolder} variant="contained" disabled={!newFolderName.trim()}>{msg.CREATE_FOLDER || "作成"}</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
                    <DialogTitle>{msg.RENAME_FOLDER || "名前の変更"}</DialogTitle>
                    <DialogContent>
                        <TextField autoFocus margin="dense" label={msg.NEW_FOLDER_NAME || "フォルダ名"} type="text" fullWidth variant="outlined" value={editFolderName} onChange={(e) => setEditFolderName(e.target.value)} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRenameDialogOpen(false)}>{msg.CANCEL}</Button>
                        <Button onClick={handleRenameFolder} variant="contained" disabled={!editFolderName.trim()}>{msg.SAVE || "保存"}</Button>
                    </DialogActions>
                </Dialog>

                <input
                    type="color"
                    ref={colorInputRef}
                    value={editFolderColor}
                    onChange={handleColorChange}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '0px', height: '0px' }}
                />
            </Box>
        </TeacherGuard>
    );
}