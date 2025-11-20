import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, Loader, AlertCircle } from 'lucide-react';

export default function QRValidator() {
  const [validNumbers, setValidNumbers] = useState(new Set());
  const [searchNumber, setSearchNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // WICHTIG: Passen Sie diese URL an Ihr GitHub Repository an
  const CSV_URL = 'https://raw.githubusercontent.com/IHR-USERNAME/qr-code-validator/main/nummern.csv';

  // CSV von GitHub laden
  useEffect(() => {
    loadCSVFromGitHub();
  }, []);

  // Beim Laden: Prüfe ob eine Nummer in der URL ist (vom QR-Code)
  useEffect(() => {
    if (validNumbers.size > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const numberFromQR = urlParams.get('number');
      if (numberFromQR) {
        setSearchNumber(numberFromQR);
        checkNumber(numberFromQR);
      }
    }
  }, [validNumbers]);

  const loadCSVFromGitHub = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(CSV_URL);
      
      if (!response.ok) {
        throw new Error('CSV-Datei konnte nicht geladen werden');
      }
      
      const text = await response.text();
      const lines = text.split('\n');
      const numbers = new Set();
      
      // Erste Zeile überspringen (Header) und alle Nummern sammeln
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          // Nimm die erste Spalte (vor dem ersten Komma oder Semikolon)
          const number = line.split(/[,;]/)[0].trim();
          if (number) {
            numbers.add(number);
          }
        }
      }
      
      setValidNumbers(numbers);
      setLoading(false);
      
    } catch (err) {
      setError('Fehler beim Laden der Datenbank. Bitte später erneut versuchen.');
      setLoading(false);
      console.error('CSV Load Error:', err);
    }
  };

  // Nummer prüfen
  const checkNumber = (number) => {
    const isValid = validNumbers.has(number.trim());
    setResult({
      number: number,
      isValid: isValid
    });
  };

  const handleSearch = () => {
    if (searchNumber.trim()) {
      checkNumber(searchNumber);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Lade-Anzeige
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Lade Datenbank...</p>
        </div>
      </div>
    );
  }

  // Fehler-Anzeige
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Fehler</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadCSVFromGitHub}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Produktvalidierung
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            {validNumbers.size} gültige Nummern in der Datenbank
          </p>

          {/* Suchfeld */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nummer eingeben oder scannen:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="z.B. 12345"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Ergebnis */}
          {result && (
            <div
              className={`p-6 rounded-lg border-2 animate-fadeIn ${
                result.isValid
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex items-center justify-center mb-4">
                {result.isValid ? (
                  <CheckCircle className="w-16 h-16 text-green-500" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-500" />
                )}
              </div>
              <h2
                className={`text-xl font-bold text-center mb-2 ${
                  result.isValid ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {result.isValid ? 'GÜLTIG ✓' : 'UNGÜLTIG ✗'}
              </h2>
              <p className="text-center text-gray-700">
                Nummer: <strong>{result.number}</strong>
              </p>
              <p className="text-center text-sm text-gray-600 mt-2">
                {result.isValid
                  ? 'Dieses Produkt ist authentisch und in unserer Datenbank registriert.'
                  : 'Diese Nummer wurde nicht in unserer Datenbank gefunden. Bitte kontaktieren Sie uns bei Fragen.'}
              </p>
            </div>
          )}

          {/* Anleitung */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              So funktioniert's:
            </h3>
            <ol className="text-xs text-gray-600 space-y-1">
              <li>1. QR-Code auf dem Produkt scannen</li>
              <li>2. Die Nummer wird automatisch geprüft</li>
              <li>3. Sofortiges Validierungsergebnis</li>
            </ol>
          </div>

          {/* Aktualisieren Button */}
          <button
            onClick={loadCSVFromGitHub}
            className="mt-4 w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Datenbank aktualisieren
          </button>
        </div>
      </div>
    </div>
  );
}