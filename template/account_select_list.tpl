	{foreach item=item from=$items}
	<div class='item' account_id='{$item->id}'>
		<div class='icon'>
			<img src='{$item->icon}'>
		</div>
		<div class='name'>
			{$item->name}
		</div>
	</div>
	{/foreach}
