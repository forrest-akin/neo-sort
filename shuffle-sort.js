// PROBLEM:
//	 Spotify's shuffle repeats songs before playing every song in a playlist
// 	 (possibly based on song popularity)

// WORKAROUND:
// 	 Shuffle-sort the playlist and play from start to beginning

// ADDITIONAL:
//   Avoid clusters of songs by a single artist by distributing each artist's
//	 songs evenly throughout the playlist
// 	 Guarantee a different resulting playlist every time by randomizing the
//	 order of songs per artist

// example song object
var Song = function() {
	this.name;
	this.artist;
	this.album;
	this.uri;
};

// example playlist - an array of song objects
var Playlist = function() {
	this.songs = [];
};

// main shuffle-sort function
var shufflePlaylist = function(playlist) {
	// map first artist listed in song.artist to _trackArtist
	playlist = playlist.map(function(song) {
		return {
			name: song.name, 
			artist: song.artist,
			album: song.album,
			uri: song.uri,
			_trackArtist: ~song.artist.indexOf(',') ? song.artist.substr(0, song.artist.indexOf(',')) : song.artist,
		};
	});
	
	// fill new array with {artist, songCount} tuples
	var artistSongCount = [];
	playlist.reduce(function(acc, song) {
		var artist = song._trackArtist;
		if(!~acc.indexOf(artist)) {
			acc.push(artist);
			artistSongCount.push({
				artist: artist,
				count: playlist.filter(function(_song) {
					return _song._trackArtist === artist;
				}).reduce(function(_acc, _song) {
					return ++_acc;
				}, 0)
			});
		}
		return acc;
	}, []);
	
	// sort artistSongCount descending by songCount
	var _compare = function(a,b) {
		if(a.count > b.count) {
			return -1;
		}
		if(a.count < b.count) {
			return 1;
		}
		return 0;
	};

	artistSongCount.sort(_compare);

	// for each artist in artistSongCount array
	var shuffledPlaylist = [];
	var firstSong = true;
	artistSongCount.forEach(function(item) {
		// filter playlist by current artist
		artistSongs = playlist.filter(function(song) {
			return item.artist === song._trackArtist;
		});

		// randomize order of songs
		shuffle(artistSongs);

		// quotient is the distance between each song if spread evenly throughout the playlist
		// quotientSum is initialized at (quotient / 2) in order to center the song distribution
		var quotient = playlist.length / artistSongs.length;
		var quotientSum = (-quotient) / 2;

		artistSongs.forEach(function(song) {
			var index;
			if(firstSong) {
				// first artist get first and last song in shuffled playlist
				// songs distributed accordingly
				shuffledPlaylist.push(song);
				quotient = (playlist.length - 1) / (artistSongs.length - 1);
				quotientSum = 0;
				firstSong = false;
			} else {
				// if only 1 song, get random index
				// else, get next index by incrementing quotientSum by quotient, rounding, and subtracting 1
				quotientSum += quotient;
				index = artistSongs.length === 1 ? Math.floor(Math.random() * playlist.length) : Math.round(quotientSum) - 1;

				// if index is already taken, find closest empty index
				var offset = 1;
				var direction = 1;
				while(index < 0 || shuffledPlaylist[index]) {
					index = index + offset;
					offset = (offset + direction) * (-1);
					direction = (direction) * (-1);
				}
				
				shuffledPlaylist[index] = song;
			}
		});
	});

	return shuffledPlaylist;
};

// Fisher-Yates shuffle
var shuffle = function(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
};