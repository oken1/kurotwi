	{foreach item=item from=$items}
	<div class='item' account_id='{$item->id}'>
		<div class='icon tooltip' tooltip='(i18n_0083):{$item->statuses_count} (i18n_0125):{$item->follow} (i18n_0122):{$item->follower}'>
			<img src='{$item->icon}'>
		</div>
		<div class='name'>
			<div><span>{$item->name}</span></div>
			<div><span class='apilimit'>(i18n_0296)</span></div>
		</div>
		<div class='buttons'>
			<a class='btn img home tooltip icon-home' tooltip='(i18n_0152)'></a>
			<a class='btn img mention tooltip icon-at' tooltip='(i18n_0026)'></a>
			<a class='btn img lists tooltip icon-list' tooltip='(i18n_0167)'></a>
		</div>
	</div>
	{/foreach}
