# Parapharma.ma Layout Redesign Guide

This guide will help you transform your current e-commerce layout to match the parapharma.ma style.

## Key Changes Overview

### 1. **Header Structure**
```
┌─────────────────────────────────────────────────┐
│ Top Banner: "Livraison gratuite pour toute..." │
├─────────────────────────────────────────────────┤
│ Logo | Search Bar | WhatsApp + Social + Cart  │
├─────────────────────────────────────────────────┤
│ Horizontal Mega Menu Navigation                │
└─────────────────────────────────────────────────┘
```

### 2. **Hero Section**
- Left: Carousel (75% width)
- Right: Two promotional banners (25% width)
- Carousel indicators: Circular dots at bottom
- Navigation: Left/right arrows with circular background

### 3. **Reassurance Block**
Four columns below hero:
- Paiement sécurisé
- Livraison offerte
- Produits certifiés
- Confidentialité

### 4. **Product Sections**
Three tabs:
- "Nos Nouveautés" (New Products)
- "Nos Promos" (Promotions)
- "Les Tendances" (Bestsellers)

### 5. **Category Section**
Title: "Explorer les catégories"
- Circular image thumbnails
- Category name below each image
- Horizontal scrollable carousel

### 6. **Brand Showcase**
- Horizontal brand logos carousel
- Title: "Nos prestigieuses marques"

### 7. **Footer**
Multi-column layout:
- Column 1: Nos Produits
- Column 2: Infos Pratiques  
- Column 3: Nous Connaitre
- Column 4: Votre Compte
- Column 5: Social Media + Logo

## Color Scheme
```css
Primary Red: #ec4249
Secondary Green: #3cabdb (for certain buttons)
Black: #333333 (text)
Gray: #f6f6f6 (backgrounds)
White: #ffffff
```

## Typography
- Headings: Bold, uppercase for main titles
- Body: Regular weight
- Button text: Bold

## Component Breakdown

### Header Top Banner
```jsx
<div className="bg-primary text-white text-center py-2 text-sm">
  <div className="container mx-auto">
    <p>Livraison gratuite pour toute commande sur Casablanca</p>
  </div>
</div>
```

### Mega Menu Navigation
```jsx
<nav className="bg-white shadow-sm">
  <div className="container mx-auto">
    <ul className="flex items-center justify-between">
      <li className="group">
        <button>Visage</button>
        <div className="hidden group-hover:block absolute">
          {/* Mega menu dropdown */}
        </div>
      </li>
      {/* More items */}
    </ul>
  </div>
</nav>
```

### Product Card Style
```jsx
<div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
  <div className="relative">
    <img src={product.imageUrl} alt={product.name} />
    {product.discount && (
      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
        -{product.discount}%
      </span>
    )}
    <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow">
      ❤️
    </button>
  </div>
  <div className="p-4">
    <h3 className="font-semibold text-sm mb-2">{product.name}</h3>
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold text-red-500">{product.price} DH</span>
      {product.oldPrice && (
        <span className="text-sm text-gray-400 line-through">{product.oldPrice} DH</span>
      )}
    </div>
    <button className="w-full mt-3 bg-primary text-white py-2 rounded text-sm font-bold hover:bg-red-600">
      j'achète !
    </button>
  </div>
</div>
```

### Reassurance Block
```jsx
<section className="bg-gray-50 py-8">
  <div className="container mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {reassuranceItems.map(item => (
        <div key={item.id} className="flex flex-col items-center text-center">
          <img src={item.icon} alt={item.title} className="w-16 h-16 mb-3" />
          <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Category Carousel
```jsx
<section className="py-12">
  <div className="container mx-auto">
    <h4 className="text-2xl font-bold mb-6">Explorer les catégories</h4>
    <div className="flex gap-4 overflow-x-auto">
      {categories.map(cat => (
        <div key={cat.id} className="flex-shrink-0 text-center">
          <img 
            src={cat.imageUrl} 
            alt={cat.name}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-2"
          />
          <h5 className="text-sm font-semibold">{cat.name}</h5>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Newsletter Block
```jsx
<section className="bg-gray-100 py-12">
  <div className="container mx-auto max-w-2xl text-center">
    <h3 className="text-2xl font-bold mb-2">Recevez nos offres spéciales</h3>
    <p className="text-gray-600 mb-6">
      Vous pouvez vous désinscrire à tout moment. Vous trouverez pour cela nos informations de contact dans les conditions d'utilisation du site.
    </p>
    <form className="flex gap-2">
      <input
        type="email"
        placeholder="Votre adresse e-mail"
        className="flex-1 px-4 py-3 border border-gray-300 rounded"
      />
      <button className="bg-primary text-white px-8 py-3 rounded font-bold hover:bg-red-600">
        S'abonner
      </button>
    </form>
  </div>
</section>
```

### Footer Structure
```jsx
<footer className="bg-gray-900 text-white">
  {/* Top Section: Service Client */}
  <div className="bg-gray-800 py-4">
    <div className="container mx-auto text-center">
      <p>SERVICE CLIENT : +(212) <strong>632 478 888</strong></p>
      <p>Pour toutes questions ou demandes du lundi au vendredi de 9h00 à 16h00</p>
      <p>MAIL : <a href="mailto:info@parapharma.ma">info@parapharma.ma</a></p>
    </div>
  </div>

  {/* Main Footer */}
  <div className="container mx-auto py-12">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
      {/* Column 1: Nos Produits */}
      <div>
        <h4 className="font-bold mb-4 text-lg">NOS PRODUITS</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="/promotion">Promotions</a></li>
          <li><a href="/nouveaux-produits">Nouveaux produits</a></li>
          <li><a href="/meilleures-ventes">Meilleures ventes</a></li>
        </ul>
      </div>

      {/* Column 2: Infos Pratiques */}
      <div>
        <h4 className="font-bold mb-4 text-lg">INFOS PRATIQUES</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="/livraison">Livraison</a></li>
          <li><a href="/mentions-legales">Mentions légales</a></li>
          <li><a href="/conditions">Conditions d'utilisation</a></li>
          <li><a href="/qui-sommes-nous">Qui sommes nous ?</a></li>
          <li><a href="/paiement-securise">Paiement sécurisé</a></li>
        </ul>
      </div>

      {/* Column 3: Nous Connaitre */}
      <div>
        <h4 className="font-bold mb-4 text-lg">NOUS CONNAITRE</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="/contactez-nous">Contactez-nous</a></li>
        </ul>
      </div>

      {/* Column 4: Votre Compte */}
      <div>
        <h4 className="font-bold mb-4 text-lg">VOTRE COMPTE</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="/mon-compte/informations">Informations personnelles</a></li>
          <li><a href="/mon-compte/commandes">Commandes</a></li>
          <li><a href="/mon-compte/adresses">Adresses</a></li>
          <li><a href="/mon-compte/bons-reduction">Bons de réduction</a></li>
        </ul>
      </div>

      {/* Column 5: Social */}
      <div>
        <img src="/logo.png" alt="Logo" className="mb-4 w-32" />
        <h4 className="font-bold mb-4">Nous suivre</h4>
        <div className="flex gap-3">
          <a href="#" className="text-white hover:text-blue-400">
            <svg className="w-6 h-6">Facebook icon</svg>
          </a>
          <a href="#" className="text-white hover:text-pink-400">
            <svg className="w-6 h-6">Instagram icon</svg>
          </a>
        </div>
      </div>
    </div>
  </div>

  {/* Footer Bottom */}
  <div className="bg-black py-4">
    <div className="container mx-auto">
      <div className="flex justify-between items-center text-sm">
        <p>COPYRIGHT © 2025 - parapharma.ma - TOUS LES DROITS RÉSERVÉS</p>
        <p>Edité par : Africa Internet Holding</p>
        <div className="flex items-center gap-2">
          <img src="/payment-icons.png" alt="Payment methods" />
          <span>MODE DE PAIEMENT</span>
        </div>
      </div>
    </div>
  </div>
</footer>
```

## Implementation Steps

1. **Start with Header**
   - Add top banner
   - Restructure main header (logo, search, icons)
   - Create horizontal mega menu

2. **Update Hero Section**
   - Split into 75/25 layout
   - Add right sidebar banners
   - Update carousel styling

3. **Add Reassurance Block**
   - Create 4-column grid
   - Add icons and text

4. **Redesign Product Sections**
   - Add tab navigation
   - Update product card styling
   - Add discount badges

5. **Update Category Display**
   - Convert to circular thumbnails
   - Add carousel functionality

6. **Add Brand Section**
   - Create horizontal brand carousel

7. **Add Newsletter**
   - Create signup form
   - Style to match

8. **Redesign Footer**
   - Create multi-column layout
   - Add all footer sections

## Next Steps

Would you like me to:
1. Implement the header with top banner and mega menu?
2. Update the hero carousel to match the 75/25 layout?
3. Add the reassurance block?
4. Create the tabbed product sections?
5. All of the above in sequence?

Let me know which section you'd like to start with!
