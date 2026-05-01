"use client"

import React, { useEffect, useState, DragEvent } from "react";
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

    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [draggedId, setDraggedId] = useState<string | null>(null);

    const [bgContextMenu, setBgContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
    const [folderContextMenu, setFolderContextMenu] = useState<{ mouseX: number; mouseY: number; folderId: string } | null>(null);

    const [openFolderId, setOpenFolderId] = useState<string | null>(null);
    
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
    const [editFolderName, setEditFolderName] = useState('');

    const [colorDialogOpen, setColorDialogOpen] = useState(false);
    const [colorFolderId, setColorFolderId] = useState<string | null>(null);
    const [editFolderColor, setEditFolderColor] = useState('#1976d2');

    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        let parsed: LayoutNode[] = saved ? JSON.parse(saved) : [];

        const existingItemIds = new Set(parsed.filter(n => n.type === 'item').map(n => n.id));
        let maxOrder = parsed.length > 0 ? Math.max(...parsed.filter(n => n.parentId === null).map(n => n.order), 0) : 0;

        const newNodes: LayoutNode[] = [];
        classes.forEach(c => {
            if (!existingItemIds.has(c.id)) {
                maxOrder++;
                newNodes.push({ id: c.id, type: 'item', parentId: null, order: maxOrder });
            }
        });

        const currentClassIds = new Set(classes.map(c => c.id));
        parsed = parsed.filter(n => n.type === 'folder' || currentClassIds.has(n.id));

        const finalLayout = [...parsed, ...newNodes];
        setLayout(finalLayout);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalLayout));
    }, [classes]);

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

    const handleOpenColorDialog = () => {
        if (!folderContextMenu) return;
        const folder = layout.find(n => n.id === folderContextMenu.folderId);
        if (folder) {
            setEditFolderColor(folder.color || '#1976d2');
            setColorFolderId(folder.id);
            setColorDialogOpen(true);
        }
        handleCloseContextMenus();
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

    const handleSaveFolderColor = () => {
        if (!colorFolderId) return;
        setLayout(prev => {
            const newLayout = prev.map(n => n.id === colorFolderId ? { ...n, color: editFolderColor } : n);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
            return newLayout;
        });
        setColorDialogOpen(false);
        setColorFolderId(null);
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
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDropOnItem = (e: DragEvent, targetId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedId || draggedId === targetId) return;

        const targetNode = layout.find(n => n.id === targetId);
        if (!targetNode) return;

        setLayout(prev => {
            const newLayout = [...prev];
            const draggedNode = newLayout.find(n => n.id === draggedId);
            if (!draggedNode || (draggedNode.type === 'folder' && targetNode.parentId === draggedNode.id)) return prev;

            draggedNode.parentId = targetNode.parentId;
            draggedNode.order = targetNode.order - 0.5;

            const siblings = newLayout.filter(n => n.parentId === targetNode.parentId).sort((a, b) => a.order - b.order);
            siblings.forEach((sib, idx) => sib.order = idx);

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
            return newLayout;
        });
        setDraggedId(null);
    };

    const handleDropOnFolder = (e: DragEvent, targetFolderId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedId || draggedId === targetFolderId) return;

        const draggedNode = layout.find(n => n.id === draggedId);
        if (!draggedNode) return;

        if (draggedNode.type === 'folder') {
            handleDropOnItem(e, targetFolderId);
            return;
        }

        setLayout(prev => {
            const newLayout = [...prev];
            const node = newLayout.find(n => n.id === draggedId);
            if (!node) return prev;

            node.parentId = targetFolderId;
            const children = newLayout.filter(n => n.parentId === targetFolderId);
            node.order = children.length > 0 ? Math.max(...children.map(n => n.order)) + 1 : 0;

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
            return newLayout;
        });
        setDraggedId(null);
    };

    const handleDropOnRoot = (e: DragEvent) => {
        e.preventDefault();
        if (!draggedId) return;

        setLayout(prev => {
            const newLayout = [...prev];
            const draggedNode = newLayout.find(n => n.id === draggedId);
            if (!draggedNode || draggedNode.parentId === null) return prev;

            draggedNode.parentId = null;
            const roots = newLayout.filter(n => n.parentId === null);
            draggedNode.order = roots.length > 0 ? Math.max(...roots.map(n => n.order)) + 1 : 0;

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLayout));
            return newLayout;
        });
        setDraggedId(null);
    };

    const ClassCardItem = ({ classData }: { classData: ClassData }) => {
        const router = useRouter();

        const detailButtonFunction = () => router.push("/classDetail?classId=" + classData.id);
        const manageButtonFunction = () => router.push("/teacher/createClass?classId=" + classData.id);
        const createTestButtonFunction = () => router.push("/teacher/createTest?classId=" + classData.id);

        return (
            <Card sx={{ height: "100%", display: 'flex', flexDirection: 'column', textAlign: "left" }}>
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
            </Card>
        );
    }

    if (!isClient) return <CircularProgress />;

    const rootNodes = layout.filter(n => n.parentId === null).sort((a, b) => a.order - b.order);

    return (
        <TeacherGuard>
            <Box onDragOver={handleDragOver} onDrop={handleDropOnRoot} onContextMenu={handleBgContextMenu} sx={{ minHeight: '60vh', pb: 10 }}>
                <Menu open={bgContextMenu !== null} onClose={handleCloseContextMenus} anchorReference="anchorPosition" anchorPosition={bgContextMenu !== null ? { top: bgContextMenu.mouseY, left: bgContextMenu.mouseX } : undefined}>
                    <MenuItem onClick={handleOpenFolderDialogFromMenu}>{msg.CREATE_FOLDER || "フォルダを作成"}</MenuItem>
                </Menu>

                <Menu open={folderContextMenu !== null} onClose={handleCloseContextMenus} anchorReference="anchorPosition" anchorPosition={folderContextMenu !== null ? { top: folderContextMenu.mouseY, left: folderContextMenu.mouseX } : undefined}>
                    <MenuItem onClick={handleOpenRenameDialog}>{msg.RENAME_FOLDER || "名前の変更"}</MenuItem>
                    <MenuItem onClick={handleOpenColorDialog}>{msg.CHANGE_FOLDER_COLOR || "色の変更"}</MenuItem>
                    <MenuItem onClick={handleDeleteFolderMenu} sx={{ color: 'error.main' }}>{msg.DELETE_FOLDER || "削除"}</MenuItem>
                </Menu>

                <Grid container spacing={2}>
                    {rootNodes.map(node => {
                        if (node.type === 'folder') {
                            const children = layout.filter(n => n.parentId === node.id).sort((a, b) => a.order - b.order);
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={node.id}>
                                    <Box draggable onDragStart={(e) => handleDragStart(e, node.id)} onDragOver={handleDragOver} onDrop={(e) => handleDropOnFolder(e, node.id)} onContextMenu={(e) => handleFolderContextMenu(e, node.id)} sx={{ height: '100%', cursor: 'grab' }}>
                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50', '&:hover': { bgcolor: 'grey.100' } }}>
                                            <CardActionArea onClick={() => setOpenFolderId(node.id)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                                                <FolderIcon sx={{ fontSize: 40, color: node.color || 'primary.main', mb: 1 }} />
                                                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" sx={{ wordBreak: 'break-word' }}>
                                                    {node.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {children.length}  {msg.TEST}
                                                </Typography>
                                            </CardActionArea>
                                        </Card>
                                    </Box>
                                </Grid>
                            );
                        } else {
                            const c = classes.find(cls => cls.id === node.id);
                            if (!c) return null;
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={node.id}>
                                    <Box draggable onDragStart={(e) => handleDragStart(e, node.id)} onDragOver={handleDragOver} onDrop={(e) => handleDropOnItem(e, node.id)} sx={{ cursor: 'grab', height: '100%' }}>
                                        <ClassCardItem classData={c} />
                                    </Box>
                                </Grid>
                            );
                        }
                    })}
                </Grid>

                <Dialog open={openFolderId !== null} onClose={() => setOpenFolderId(null)} maxWidth="md" fullWidth>
                    {openFolderId && (
                        <>
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
                                        return (
                                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={child.id}>
                                                <Box draggable onDragStart={(e) => handleDragStart(e, child.id)} onDragOver={handleDragOver} onDrop={(e) => handleDropOnItem(e, child.id)} sx={{ cursor: 'grab', height: '100%' }}>
                                                    <ClassCardItem classData={c} />
                                                </Box>
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
                        </>
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

                <Dialog open={colorDialogOpen} onClose={() => setColorDialogOpen(false)}>
                    <DialogTitle>{msg.CHANGE_FOLDER_COLOR || "色の変更"}</DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, pt: 3 }}>
                        <FolderIcon sx={{ fontSize: 80, color: editFolderColor }} />
                        <input
                            type="color"
                            value={editFolderColor}
                            onChange={(e) => setEditFolderColor(e.target.value)}
                            style={{ width: '100%', height: '50px', cursor: 'pointer', border: 'none', padding: 0 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setColorDialogOpen(false)}>{msg.CANCEL}</Button>
                        <Button onClick={handleSaveFolderColor} variant="contained">{msg.SAVE || "保存"}</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </TeacherGuard>
    );
}