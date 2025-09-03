import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  Image,
  Music,
  FileText,
  Search,
  Filter,
  Upload,
  Plus,
  Grid,
  List,
  Download,
  Trash2,
  Star,
  Heart
} from 'lucide-react';

interface GameAsset {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'text' | 'animation';
  url: string;
  category: string;
  tags: string[];
}

interface AssetLibraryProps {
  assets: GameAsset[];
  onSelectAsset: (asset: GameAsset) => void;
}

const AssetLibrary: React.FC<AssetLibraryProps> = ({ assets, onSelectAsset }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = [
    { value: 'all', label: 'Todos los assets' },
    { value: 'backgrounds', label: 'Fondos' },
    { value: 'sprites', label: 'Sprites' },
    { value: 'ui', label: 'Interfaz' },
    { value: 'audio', label: 'Audio' },
    { value: 'animations', label: 'Animaciones' }
  ];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (assetId: string) => {
    setFavorites(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'animation': return <Star className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getAssetPreview = (asset: GameAsset) => {
    switch (asset.type) {
      case 'image':
        return (
          <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
            <img
              src={asset.url}
              alt={asset.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'flex';
              }}
            />
            <div className="hidden w-full h-full bg-gray-200 flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="w-full h-24 bg-blue-100 rounded flex items-center justify-center">
            <Music className="w-8 h-8 text-blue-600" />
          </div>
        );
      
      case 'text':
        return (
          <div className="w-full h-24 bg-green-100 rounded flex items-center justify-center">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        );
      
      case 'animation':
        return (
          <div className="w-full h-24 bg-purple-100 rounded flex items-center justify-center">
            <Star className="w-8 h-8 text-purple-600" />
          </div>
        );
      
      default:
        return (
          <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <FolderOpen className="w-4 h-4 mr-2" />
          Biblioteca de Assets ({assets.length})
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controles */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Botón de subir */}
      <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors">
        <Upload className="w-4 h-4" />
        <span>Subir Asset</span>
      </button>

      {/* Lista de assets */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-8">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay assets disponibles
          </h3>
          <p className="text-gray-600 text-sm">
            {searchQuery || selectedCategory !== 'all' 
              ? 'No se encontraron assets con los filtros aplicados'
              : 'Sube algunos assets para comenzar'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
          {filteredAssets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                viewMode === 'list' ? 'flex items-center space-x-3 p-3' : ''
              }`}
              onClick={() => onSelectAsset(asset)}
            >
              {viewMode === 'grid' ? (
                <>
                  {getAssetPreview(asset)}
                  <div className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {asset.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {asset.category}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(asset.id);
                        }}
                        className={`p-1 rounded ${
                          favorites.includes(asset.id)
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <Heart className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {asset.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {asset.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{asset.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    {getAssetIcon(asset.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {asset.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {asset.category} • {asset.tags.join(', ')}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(asset.id);
                      }}
                      className={`p-1 rounded ${
                        favorites.includes(asset.id)
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <Heart className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Implementar descarga
                        console.log('Download asset:', asset);
                      }}
                      className="p-1 rounded text-gray-400 hover:bg-gray-50"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Assets favoritos */}
      {favorites.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Heart className="w-4 h-4 mr-2 text-red-500" />
            Favoritos ({favorites.length})
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            {assets
              .filter(asset => favorites.includes(asset.id))
              .map((asset) => (
                <div
                  key={asset.id}
                  className="p-2 border border-gray-200 rounded text-xs cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectAsset(asset)}
                >
                  <div className="flex items-center space-x-2">
                    {getAssetIcon(asset.type)}
                    <span className="truncate">{asset.name}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetLibrary;
